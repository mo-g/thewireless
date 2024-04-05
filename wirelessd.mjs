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
import { Dials, Switches, NeedleServo, Stations } from './config.mjs';


const apiPort = 1932;

/**
 * Hardcoding speaker settings to avoid pain from mismatched sample rates, as we're not doing transcoding.
 */
const speakerSettings = {
    channels: 2, bitDepth:16, sampleRate: 44100
};
const outputSpeaker = new Speaker(speakerSettings);

/**
 * Load all stations. They don't take much resource loaded, and don't pull any audio from the server till you hit play.
 */
var liveStations = {};
for (const stationName of Object.keys(Stations)) {
    liveStations[stationName] = Station.from(Stations[stationName]);
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
    return responder.send(Object.keys(liveStations));
});

apiService.get('/stations/:station', (request, responder) => {
    var station = request.params.station
    if (station in liveStations) {
        return responder.send(liveStations[station]);
    };
    console.log("Station", station, "not currently loaded.");
    responder.status(404);
    return responder.send("Station", station, "not known. Load /stations endpoint for current list.");
});

apiService.get('/stations/:station/:volume', (request, responder) => {
    var station = request.params.station
    if (!(station in liveStations)) {
        console.log("Station", station, "not currently loaded.");
        responder.status(404);
        return responder.send("Station", station, "not known. Load /stations endpoint for current list.");
    };
    var volume = parseFloat(request.params.volume);
    liveStations[station].volume = volume;
    return responder.send(true);

});

apiService.get('/speaker', (request, responder) => {
    return responder.send(outputSpeaker);
});

apiService.get('/volume/:volume', (request, responder) => {
    var volume = parseFloat(request.params.volume);
    liveStations[liveStation].volume = volume;
    return responder.send(true);
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
