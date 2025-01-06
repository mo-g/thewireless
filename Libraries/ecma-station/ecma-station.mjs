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


import fs from 'fs';


const StreamProtocol = {
    InternetStation: "Any Internet Radio Protocol",
    Static: "Pseudorandom White Noise File"
};


class Station {
    constructor ({url = ""} = {}) {
        if (!url) {
            throw "Null URL or URL not passed."
        }
        this.url = url;
    }

    static from (streamSpecs) {
        switch (streamSpecs.type)  {
            case StreamProtocol.InternetStation:
                return new InternetStation({url: streamSpecs.url});
                break;
            case StreamProtocol.Static:
                return new Static({url: streamSpecs.url});
                break;
            default:
                throw "Unsupported protocol:", streamSpecs.type;
        };
    }

    set player(player) {
        this._player = player;
    }

    get player() {
        return this._player;
    }

    play () {
        //tell MPD to play

        /*

        Clear existing playlist.
        Add station URL to playlist.
        Play playlist.

        */

        this.player.api.playback.pause();
        this.player.api.queue.clear();
        this.player.api.queue.add(this.url);
        this.player.api.playback.play();
    }

    crossfade () {
        /* Upgraded version of play - needs to be written.
            Add station URL to playlist.
            Skip to next with crossfade.
            Remove previous station from playlist.
        
        */
    }

    pause () {
        this.player.api.playback.pause();
    }

    unpause () {
        this.player.api.playback.play();
    }

    toJSON () {
        return {type: "undefined", url: this.url};
    }
}

class InternetStation extends Station {
    constructor ({url = ""} = {}){
        super({url: url})
        console.log("Streaming from:", url)
    }

    toJSON () {
        return {type: "InternetStation", url: this.url};
    }
}

/**
 * This static noise generator will sit between stations!
 * 
 * Need to find a way to refill the stream on demand with more static.
 */
class Static extends Station {
    constructor ({url = ""} = {}) {
        super({url: url})
        this.ready=true;
    }

    parseMetadata = (metadata) => {
        this.metadata = metadata;
    }

    play (player) {
        // Override to set loop.
    }

    toJSON () {
        return {type: "Static"}
    }
}

export { StreamProtocol, Station, InternetStation };
