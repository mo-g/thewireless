import { StreamProtocol } from "./Libraries/ecma-station/ecma-station.mjs";
import { DialType, BandAction } from "./Libraries/ecma-tunerface/ecma-tunerface.mjs"


/**
 * These variables define your Wireless set. Modify as required.
 */

const Dials = {
    band: {
        jitter: 5,
        type: DialType.Band,
        deadbandLimit: 0.01,
        maximum: 1,
        channel: 0
    },
    tuner: {
        jitter: 5,
        type: DialType.Tuner,
        min: 0.01,
        max: 1,
        channel: 1,
        activeNeedle: null /*{
            ioPin: 7,
            // Need to define the movement mapping here somehow.
        }*/
    },
    volume: {
        jitter: 5,
        type: DialType.Volume,
        min: 0.01,
        trigger: 0.1,
        max: 1,
        channel: 2
    }
};


/*
    Define the radio stations. frequency ranges must not overlap. 
    static is a "magic value" - the item called "static" will always be the fallback.
*/
const Stations = {
    static: {
        type: StreamProtocol.Static,
        url: "file:///opt/thewireless/static.mp3"
    },
    camfm: {
        frequencyMin: 220,
        frequencyMax: 250,
        type: StreamProtocol.InternetStation,
        url: "https://stream.camfm.co.uk/camfm"
    },
    pvfm3: {
        frequencyMin: 10,
        frequencyMax: 40,
        type: StreamProtocol.InternetStation,
        url: "https://dj.bronyradio.com/pvfmfree.ogg"
    },
    monstro: {
        frequencyMin: 70,
        frequencyMax: 100,
        type: StreamProtocol.InternetStation,
        url: "https:\/\/radio.dripfeed.net\/listen\/monstromental\/radio.mp3"
    },
    esr: {
        frequencyMin: 120,
        frequencyMax: 150,
        type: StreamProtocol.InternetStation,
        url: "https://streamer.radio.co/s2c3cc784b/listen"
    },
    pulse: {
        frequencyMin: 170,
        frequencyMax: 200,
        type: StreamProtocol.InternetStation,
        url: "http://firewall.pulsradio.com"
    }
};

/**
 * Define the "bands" (really, control states) for the Band dial.
 */
const Bands = {
    on: {
        type: BandAction.RadioPlay,
        "frequencyMin": 0,
        "frequencyMax": 100,
    },
    off: {
        type: BandAction.RadioPause,
        "frequencyMin": 150,
        "frequencyMax": 256,
    }
}


export { Dials, Stations, Bands }