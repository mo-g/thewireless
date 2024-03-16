/**
 * ecma-station, a class to represent internet radio stations in ECMAScript.
 * Copyright (C) 2023 mo-g
 * 
 * ecma-station is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 * 
 * ecma-station is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with ecma-station  If not, see <https://www.gnu.org/licenses/>.
 */


import icyClient from 'icy';
import hlxFileReader from 'hlx-file-reader';
import { OggVorbisDecoder } from '@wasm-audio-decoders/ogg-vorbis';
import fs from 'fs';
import Speaker from 'speaker-arm64';
import stream from "stream";

const oggDecoder = new OggVorbisDecoder();
await oggDecoder.ready;

const StreamProtocol = {
    ICY: "Uses the ShoutCAST ICY Protocol",
    HLS: "Uses the Apple HLS Protocol"
};

const NullOutput = fs.createWriteStream('/dev/null');


class Station {
    constructor ({url = ""} = {}) {
        if (!url) {
            throw "Null URL or URL not passed."
        }
        this.url = url;
    }

    static from (streamSpecs) {
        switch (streamSpecs.type)  {
            case StreamProtocol.ICY:
                return new ICYStation({url: streamSpecs.url});
                break;
            case StreamProtocol.HLS:
                return new HLSStation({url: streamSpecs.url});
                break;
            default:
                throw "Unsupported protocol:", streamSpecs.type;
        };
    }
}

class ICYStation extends Station {
    constructor ({url = ""} = {}){
        super({url: url})

        this.decoder = NullOutput
        this.output = NullOutput;
        this.output = new stream.PassThrough();
        this.output.pipe(new Speaker());
        icyClient.get(this.url, this.setupStream);
    }

    setupStream  = (response) =>  {
        // log the HTTP response headers
        console.error(response.headers);
        
        if (response.headers['content-type'] == 'application/ogg') {
            console.log("VORBIS Stream");
            this.decoder = oggDecoder
            
            /*
            Legacy code for node-vorbis which is broken on ARM
            
            this.decoder = new ogg.Decoder();
            this.decoder.on('stream', function (stream) {
                var vd = new vorbis.Decoder();
                vd.on('format', function (format) {
                    vd.pipe(new speaker());
                });
                stream.pipe(vd);
            });*/
        }
        // log any "metadata" events that happen
        response.on('metadata', this.parseMetadata);
        this.decoder.decode(response)
            .then((result) => this.output.write(new Buffer.from(result.channelData[0])));
    }

    parseMetadata = (metadata) => {
        console.log(metadata)
    }
}

class HLSStation extends Station {
    constructor ({url = ""} = {}){
        super({url: url})
    }
}


class Static extends Station {
    constructor ({url = ""} = {}){
        super({url: url})
    }
}

export { StreamProtocol, Station, NullOutput, Static };
