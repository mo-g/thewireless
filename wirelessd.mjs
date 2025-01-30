/**
 * thewireless, an internet radio client for upcycling with Pi.
 * Copyright (C) 2023 mo-g
 * 
 * thewireless is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 * 
 * thewireless is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with thewireless  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Note - this program will initially contain methods and assumptions that will
 * be transferred to more specific models, config and interfaces as development
 * progresses. This will start ugly and clean up as we work out the final
 * architecture.
 */


//import mcpspi from 'mcp-spi-adc';
//import gpio from 'rpi-gpio';
import express from 'express';
import { Station, InternetStation, StreamProtocol} from "./Libraries/ecma-station/ecma-station.mjs";
import { Dial, VolumeDial} from "./Libraries/ecma-tunerface/ecma-tunerface.mjs";
import { Dials, Stations, Bands } from './config.mjs';
import mpdapi from 'mpd-api';

const apiPort = 1932; // Port on which thewireless listens for control commands.

// Settings for the default MPD player. Should be moved to config, and have support for multiple players added (without sync).
const mpdConfig = {
    path: "/run/mpd/socket"
};

const mpdInstance = await mpdapi.connect(mpdConfig);

/**
 * Load all stations. They don't take much resource loaded, and don't pull any audio from the server till you hit play.
 */
var liveStations = {};
for (const stationName of Object.keys(Stations)) {
    liveStations[stationName] = Station.from(Stations[stationName]);
    liveStations[stationName].player = mpdInstance;
};
var liveStation = null;

/**
 * Set up the API Server.
 */
var apiService = new express();
apiService.use(express.json());

apiService.get('/', (request, responder) => {
    var hostname = request.hostname;
    return responder.send(
        {"links": {
            "stations": "http://"+hostname+":"+apiPort+"/"+"stations",
            "play": "http://"+hostname+":"+apiPort+"/"+"play",
            "pause": "http://"+hostname+":"+apiPort+"/"+"pause",
            "volume": "http://"+hostname+":"+apiPort+"/"+"volume"
        }
    });
});

apiService.get('/stations', (request, responder) => {
    var hostname = request.hostname;
    var stationLinks = {};
    Object.keys(liveStations).forEach(function (station) {
        stationLinks[station] = "http://"+hostname+":"+apiPort+"/"+"stations/"+station
      })
    return responder.send({"links": stationLinks});
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

apiService.get('/volume', (request, responder) => {
    responder.status(501)
    return responder.send(false);
});

apiService.put('/volume', (request, responder) => {
    var volume = parseInt(request.body.volume);
    if (volume >= 0 & volume <= 100) {
        console.log("Setting volume to:", volume);
        mpdInstance.api.playback.setvol(volume)
        return responder.send(true);
    }
    responder.status(422)
    return responder.send(false)
});

/**
 * Get the currently playing station, and preferably - the currently playing track from supporting stations.
 */

apiService.get('/play', (request, responder) => {
    //responder.status(501)
    return responder.send([liveStation]);
});

apiService.put('/play/', (request, responder) => {
    if (request.body === undefined) {
        request.body = {};
    }
    if (Object.keys(request.body).includes("station")) {
        var station = request.body.station
        if (!(station in liveStations)) {
            console.log("Station", station, "not currently loaded.");
            responder.status(404);
            return responder.send(false);
        };

        if (!(liveStation)) {
            liveStation = station;
            liveStations[station].play();
        };

        if (liveStation == station) {
            return responder.send([true]);
        };

        mpdInstance.api.playback.pause();
        console.log("Starting playback of:", station)
        liveStation = station;
        return setTimeout((stationObject, responderObject) => {
            stationObject.play();
            responderObject.send([true]);
        }, 500, liveStations[station], responder);
    } else {
        if (liveStation) {
            console.log("Resuming Playback");
            return responder.send([mpdInstance.api.playback.play()]);
        }
        responder.status(404);
        return responder.send([false]);
    };
});


/**
 * Stop playback
 */
apiService.put('/pause', (request, responder) => {
    console.log("Stopping Playback");
    mpdInstance.api.playback.pause();
    return responder.send(false);
});

apiService.listen(apiPort, () =>
    console.log(`Wireless control REST API now active on TCP port ${apiPort}!`),
);

var volumeDial = Dial.from(Dials.volume, mpdInstance.api.playback.setvol);

var readingTest = false;
var readingInterval = setInterval(_ => {
    readingTest = volumeDial.monitor();
    if (readingTest == true) {
        clearInterval(readingInterval);
    }
}, 100);




/**
 * Do something useful:
 */



//var interStation = new Static();
