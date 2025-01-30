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
    constructor (adcPin, callback, jitter) {
        this._notice = "New Frequency:"
        this._jitter = jitter;
        this.ready = true;
        this.interval = null;
        this._value = 0;
        this.callback = callback;
        this._firstValue = true;
        this._dial = mcpspi.openMcp3004(adcPin, err => {this.startHandler(err)} );
    }

    static from (dialSpecs, callback) {
        var type = dialSpecs.type;
        var channel = dialSpecs.channel;
        var jitter = dialSpecs.jitter;
        switch (dialSpecs.type)  {
            case DialType.Volume:
                return new VolumeDial(channel, callback, jitter);
                break;
            case DialType.Tuner:
                if (dialSpecs.activeNeedle) {
                    return new ActiveTunerDial(channel, callback, jitter);
                }
                return new TunerDial(channel, callback, jitter);
                break;
            case DialType.Band:
                return new BandDial(channel, callback, jitter);
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
        if (err) {
            console.log(err);
            return false;
        }

        var frequency = Math.round(reading.rawValue/4);
        if ((frequency > (this._value + this._jitter)) || (frequency < (this._value - this._jitter))) {
            this._value = frequency;
            if (this._firstValue) {
                this._firstValue = false;
            } else {
                console.log(this._notice, frequency+"kHz");
                this.callback(frequency);
            }
        }
        return true;
    }

    monitor () {
        if (!(this.ready)) {
            return false;
        };
        this.interval = setInterval(_ => {
            this._dial.read((err, reading) => { this.readHandler.bind(this); this.readHandler(err, reading) });
          }, 50);
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
    constructor (adcPin, jitter, callback) {
        super(adcPin, jitter, callback)
        this._notice = "New Band Frequency:"
    }

    readHandler (err, reading) {
        if (err) {
            console.log(err);
            return false;
        }

        var frequency = Math.round(reading.rawValue/4);
        if ((frequency > (this._value + this._jitter)) || (frequency < (this._value - this._jitter))) {
            this._value = frequency;
            console.log(this._notice, frequency+"kHz");
            this.callback(frequency);
        }
        return true;
    }
}

class TunerDial extends Dial {
    constructor (adcPin, jitter, callback) {
        super(adcPin, jitter, callback)
        this._notice = "New Tuner Frequency:"
    }
}

class ActiveTunerDial extends TunerDial {
    constructor (adcPin, jitter, callback, servoPin) {
        super(adcPin, jitter, callback)
        this.servoPin = servoPin;
    }

    /**
     * Actuate the servo to set desired value.
     */
    set value (newValue) {

    }
}


class VolumeDial extends Dial {
    constructor (adcPin, jitter, callback) {
        super(adcPin, jitter, callback)
    }

    readHandler (err, reading) {
        if (err) {
            console.log(err);
            return false;
        }

        var percent = Math.round(reading.rawValue/1024*100);
        if ((percent > (this._value + this._jitter)) || (percent < (this._value - this._jitter))) {
            this._value = percent;
            if (this._firstValue) {
                this._firstValue = false;
            } else {
                console.log("New volume:", percent+"%");
                this.callback(percent);
            }
        }
        return true;
    }
}


export { DialType, BandAction, Dial, BandDial, TunerDial, ActiveTunerDial, VolumeDial };