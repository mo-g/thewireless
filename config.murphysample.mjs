import { StreamProtocol } from "./Libraries/ecma-station/ecma-station.mjs";
import { DialType, BandAction } from "./Libraries/ecma-tunerface/ecma-tunerface.mjs"


/**
 * These variables define your Wireless set. Modify as required.
 * 
 * For the "DC" Murphy 146 Build:
 * 
 * Vol: 0, Tune: 1, Left: 2, Right: 3
 */

const Dials = {
    band: {
        jitter: 2,
        type: DialType.Band,
        minimum: 0,
        deadbandLimit: 10,
        maximum: 255,
        channel: 2
    },
    tuner: {
        jitter: 2,
        type: DialType.Tuner,
        min: 0,
        max: 255,
        channel: 1,
        activeNeedle: null
    },
    volume: {
        jitter: 2,
        type: DialType.Volume,
        min: 0,
        trigger: 0.1,
        max: 255,
        channel: 0
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


export { Jitter, Dials, Stations, Bands }
