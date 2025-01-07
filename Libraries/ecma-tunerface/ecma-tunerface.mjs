/**
 * ecma-tunerface, a class to represent an internet radio physical user interface in ECMAScript.
 * Copyright (C) 2024 mo-g
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


import mcpspi from 'mcp-spi-adc';

const JITTERGAP = 2;

const DialType = {
    Volume: "Controls the volume (loudness) of the speaker output.",
    Band: "Controls the output mode (function) of the speaker.",
    Tuner: "Selects a channel in the radio station list."
}

const BandAction = {
    RadioPlay: "Begin/continue playing radio.",
    RadioPause: "Pause/stop playing radio.",
    AirPlay: "Allow AirPlay override (NOT IMPLEMENTED)",
    GoogleCast: "Allow Chromecast override (NOT IMPLEMENTED)",
    Matter: "Allow Matter override (NOT IMPLEMENTED)"
};


class Dial {
    constructor (adcPin, callback) {
        this.ready = true;
        this.interval = null;
        this._value = 0;
        this.callback = callback;
        this._dial = mcpspi.openMcp3004(adcPin, err => {this.startHandler(err)} );
    }

    static from (dialSpecs, callback) {
        var type = dialSpecs.type;
        var channel = dialSpecs.channel;
        switch (dialSpecs.type)  {
            case DialType.Volume:
                return new VolumeDial(channel, callback);
                break;
            case DialType.Tuner:
                if (dialSpecs.activeNeedle) {
                    return new ActiveTunerDial(channel, callback);
                }
                return new TunerDial(channel, callback);
                break;
            case DialType.Band:
                return new BandDial(channel, callback);
                break;
            default:
                throw "Unsupported dial type:", type;
        };
    }

    startHandler (err) {
        if (err) {
            console.log(err);
            this.ready = false;
        };
    }

    readHandler (err, reading) {
        console.log("This is the Super Handler. Something has gone wrong!")
        if (err) {
            console.log(err);
        } else {
            //console.log(value);
            //this._value = reading;
        };
    }

    monitor () {
        if (!(this.ready)) {
            return false;
        };
        this.interval = setInterval(_ => {
            this._dial.read((err, reading) => { this.readHandler.bind(this); this.readHandler(err, reading) });
          }, 500);
          return true;
    }

    unmonitor () {
        return clearInterval(this.interval);
    }

    get value () {
        return this._value;
    }
}

class BandDial extends Dial {
    constructor (adcPin, callback) {
        super(adcPin, callback);
    }
}

class TunerDial extends Dial {
    constructor (adcPin, callback) {
        super(adcPin, callback);
    }
}

class ActiveTunerDial extends Dial {
    constructor (adcPin, callback) {
        super(adcPin, callback);
        this.servoPin = servoPin;
    }

    /**
     * Actuate the servo to set desired value.
     */
    set value (newValue) {

    }
}


class VolumeDial extends Dial {
    constructor (adcPin, callback) {
        super(adcPin, callback)
    }

    readHandler (err, reading) {
        if (err) {
            console.log(err);
            return false;
        }

        var percent = Math.round(reading.rawValue/1024*100);
        if ((percent > (this._value + JITTERGAP)) || (percent < (this._value - JITTERGAP))) {
            console.log("New volume:", percent+"%");
            this._value = percent;
            this.callback(percent);
        }
        return true;
    }
}

class Band {
    constructor () {

    }
    static from (bandSpecs) {

    }

}


export { DialType, BandAction, Dial, BandDial, TunerDial, ActiveTunerDial, VolumeDial };