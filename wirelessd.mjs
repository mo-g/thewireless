/**
 * 1950called, an internet radio client for upcycling with Pi.
 * Copyright (C) 2023 mo-g
 * 
 * 1950called is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 * 
 * 1950called is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with 1950called  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Note - this program will initially contain methods and assumptions that will
 * be transferred to more specific models, config and interfaces as development
 * progresses. This will start ugly and clean up as we work out the final
 * architecture.
 */


//import mcpspi from 'mcp-spi-adc';
//import gpio from 'rpi-gpio';
import Speaker from "speaker-arm64";
import express from 'express';
import { Station, StreamProtocol, Static } from "./Libraries/ecma-station/ecma-station.mjs";


const configFile = "./config.mjs";
const apiPort = 1932;

/**
 * These variables define your Wireless set. Modify as required.
 */

const dials = {
    tone: {
        min: 0.01,
        max: 1,
        channel: 0
    },
    volume: {
        min: 0.01,
        trigger: 0.1,
        max: 1,
        channel: 2
    },
    tuner: {
        min: 0.01,
        max: 1,
        channel: 1,
        integralDial: false
    }
};

const switches = {}

const stations = {
    camfm: {
        frequencyMin: 90,
        frequencyMax: 95,
        type: StreamProtocol.ICY,
        url: "https://stream.camfm.co.uk/camfm"
    },
    pvfm3: {
        frequencyMin: 80,
        frequencyMax: 85,
        type: StreamProtocol.ICY,
        url: "https://dj.bronyradio.com/pvfmfree.ogg"
    },
    monstro: {
        type: StreamProtocol.ICY,
        url: "https:\/\/radio.dripfeed.net\/listen\/monstromental\/radio.mp3"
    },
    esr: {
        type: StreamProtocol.ICY,
        url: "https://streamer.radio.co/s2c3cc784b/listen"
    },
    test: {
        type: StreamProtocol.ICY,
        url: "http://firewall.pulsradio.com"
    }
};

/**
 * Al outputs will be played simultaneously.
 * Currently, there's no latency compensation implemented.
 */
const audioOutputs = {
    speaker: {
        alsaDevice: "hw0,0",
        latency: 0,
        channels: 1,
        bitDepth: 16,
        bitRate: 44100
    }
};

const speakerSettings = {
    channels: 2, bitDepth:16, sampleRate: 48000
};

const dialServo = {
    ioPin: 7
}

const outputSpeaker = new Speaker(speakerSettings);

var liveStations = {};
for (const stationName of Object.keys(stations)) {
    liveStations[stationName] = Station.from(stations[stationName]);
};
var liveStation = null;

/**
 * Set up the API Server.
 */
var apiService = new express();
apiService.use(express.json());

apiService.get('/', (request, responder) => {
    return responder.send(["stations", "play"]);
});

apiService.get('/stations', (request, responder) => {
    return responder.send(Object.keys(stations));
});


apiService.get('/speaker', (request, responder) => {
    return responder.send(outputSpeaker);
});

apiService.get('/stations/:station', (request, responder) => {
    var station = request.params.station
    if (station in stations) {
        return responder.send(stations[station]);
    };
    console.log("Station", station, "not currently loaded.");
    responder.status(404);
    return responder.send("Station", station, "not known. Load /stations endpoint for current list.");
});

/**
 * Get the currently playing station, and preferably - the currently playing track from supporting stations.
 */
apiService.get('/status', (request, responder) => {
    //responder.status(501)
    return responder.send([liveStation]);
});
/**
 * This should actually be a put, without :station, but I'm being lazy.
 */
apiService.get('/play/:station', (request, responder) => {
    var station = request.params.station
    if (!(station in liveStations)) {
        console.log("Station", station, "not currently loaded.");
        responder.status(404);
        return responder.send("Station " + station + " not known. Load /stations endpoint for current list.");
    };

    if (!(liveStations[station].ready)) {
        responder.status(425);
        return responder.send("Station " + station + " is not ready to play.");
    };

    if (!(liveStation)) {
        liveStation = station;
        liveStations[station].play(outputSpeaker);
    };

    if (liveStation == station) {
        return responder.send([true]);
    };

    liveStations[liveStation].stop();
    liveStation = station;
    return setTimeout((stationObject, speakerObject, responderObject) => {
        stationObject.play(speakerObject);
        responderObject.send([true]);
    }, 500, liveStations[station], outputSpeaker, responder);
});

apiService.get('/play', (request, responder) => {
    if (liveStation) {
        liveStations[liveStation].play(outputSpeaker);
        return responder.send([true]);
    }
    responder.status(404);
    return responder.send([false]);
});

/**
 * Stop playback
 */
apiService.get('/stop', (request, responder) => {
    //responder.status(501)
    liveStations[liveStation].stop();
    //liveStation = null;
    return responder.send(false);
});

apiService.listen(apiPort, () =>
    console.log(`Combadge control REST API now active on TCP port ${apiPort}!`),
);



/**
 * Do something useful:
 */



//var interStation = new Static();
