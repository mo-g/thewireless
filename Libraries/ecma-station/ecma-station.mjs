/**
 * ecma-station, a class to represent internet radio stations in ECMAScript.
 * Copyright (C) 2023-24 mo-g
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


import icyClient from 'ecma-iceclient';
import hlxFileReader from 'hlx-file-reader';
import vorbis from 'vorbis';
import ogg from 'ogg';
import lame from 'lame';
import fs from 'fs';
import Speaker from 'speaker-arm64';
import getRandomValues from 'get-random-values';
import { Readable } from 'stream';
import { FileWriter } from 'wav';
import MemoryStream from 'memorystream';


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
        console.log("Streaming from:", url)
        icyClient.get(this.url, this.setupStream);
    }

    setupStream  = (response) =>  {
        // log the HTTP response headers
        //console.error(response.headers);

        if (!response.headers) {
            throw "Not a valid ICY Stream!"
        }

        var uniformHeaders = {};
        Object.keys(response.headers).forEach(function (key) {
            uniformHeaders[key.toLowerCase()] = response.headers[key];
        });

        if (!('content-type' in uniformHeaders)) {
            throw "Content-Type not specified.";
        } else {
            var codec = uniformHeaders['content-type'];
        }
        
        switch (codec) {
            case "application/ogg":
                console.log("VORBIS Stream");
                this.decoder = new ogg.Decoder();
                this.decoder.on('stream', function (stream) {
                    var vd = new vorbis.Decoder();
                    vd.on('format', function (format) {
                        vd.pipe(new Speaker());
                    });
                    stream.pipe(vd);
                });
                break;
            case "audio/mpeg":
                console.log("MPEG1_3 Stream");
                this.decoder = new lame.Decoder();
                var decoder = this.decoder;
                this.decoder.on('format', function (format) {
                    decoder.pipe(new Speaker());
                });
                break;
            case "audio/aacp":
                throw "AAC not supported yet!";
            default:
                throw "Unsupported CODEC:", codec;
        }
        // log any "metadata" events that happen
        response.on('metadata', this.parseMetadata);
        response.pipe(this.decoder);
    }

    parseMetadata = (metadata) => {
        console.log(metadata.toString());
    }
}

class HLSStation extends Station {
    constructor ({url = ""} = {}){
        super({url: url})
    }
}

/**
 * This static noise generator will sit between stations!
 * 
 * Need to find a way to refill the stream on demand with more static.
 */
class Static {
    constructor (sampleRate = 44100) {
        this.sampleRate = sampleRate;
        this.stream = Readable.from(this.generateNoise());
        this.stream.pipe(new Speaker());

    }

    generateNoise () {
        var bufferSize = this.sampleRate * 5;
        var output = new Int16Array(bufferSize);
          
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 32768 - 1;
        }
        return Buffer.from(output);
    }
}

export { StreamProtocol, Station, NullOutput, Static };
