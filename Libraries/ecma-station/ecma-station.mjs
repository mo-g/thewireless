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
import getRandomValues from 'get-random-values';
import { Readable, Transform } from 'stream';
import { FileWriter } from 'wav';
import MemoryStream from 'memorystream';
import BitCrusher from 'pcm-bitdepth-converter';
import Volume from 'pcm-volume';


const Converter = BitCrusher.From32To16Bit;

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
        this.volumeOut = new Volume();
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

        this.decoderIn = NullOutput
        this.decoderOut = NullOutput
        this.output = NullOutput;
        this.source = null
        this.ready = false;
        this.metadata = null;
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
        var decoderGlobal = null;
        switch (codec) {
            case "application/ogg":
                console.log("VORBIS Stream");
                this.decoderIn = new ogg.Decoder();
                this.decoderIn.on('stream', function (stream) {
                    var vorbisDecoder = new vorbis.Decoder();
                    vorbisDecoder.on('format', function (format) {
                        var bitCrusher = new Converter();
                        vorbisDecoder.pipe(bitCrusher);
                        decoderGlobal = bitCrusher;
                    });
                    stream.pipe(vorbisDecoder);
                });
                break;
            case "audio/mpeg":
                console.log("MPEG1_3 Stream");
                this.decoderIn = new lame.Decoder();
                var lameDecoder = this.decoderIn;
                lameDecoder.on('format', function (format) {
                    decoderGlobal = lameDecoder;
                });
                break;
            case "audio/aacp":
                throw "AAC not supported yet!";
            default:
                throw "Unsupported CODEC:", codec;
        }

        function awaitDecoder(parentObject) {
            if (decoderGlobal) {
                parentObject.decoderOut = decoderGlobal;
                parentObject.decoderOut.pipe(parentObject.volumeOut);
                parentObject.ready = true;
            } else {
                setTimeout(() => {
                    awaitDecoder(parentObject);
                }, 33);
            }
        };
        awaitDecoder(this);
        // log any "metadata" events that happen
        response.on('metadata', this.parseMetadata);
        this.source = response;
        this.source.pipe(this.decoderIn)
    }

    play (speaker) {
        this.volumeOut.pipe(speaker);
    }

    stop () {
        this.volumeOut.unpipe();
    }

    set volume (value) {
        this.volumeOut.setVolume(value);
        return value;
    }

    parseMetadata = (metadata) => {
        this.metadata = metadata;
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
