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
import speaker from "speaker";

import { Station, StreamProtocol } from "./Libraries/ecma-station/ecma-station.mjs";


const configFile = "./config.js";

/**
 * The next constants should be moved into the config file.
 */

const dials = {
    tone: {
        min: 100,
        max: 900,
        channel: 2
    },
    volume: {
        min: 50,
        trigger: 150,
        max: 900,
        channel: 0
    },
    tuner: {
        min: 100,
        max: 900,
        channel: 1,
        integralDial: false
    }
};

const switches = {
    power: {
        ioPin: 7,
        onState: true
    }
}

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
    }
};

const defaultStation = "static";

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
        bitRate: 16000
    }
};

const dialServo = {
    ioPin: 20
}


/**
 * Do something useful:
 */

var station = Station.from(stations.pvfm3);
