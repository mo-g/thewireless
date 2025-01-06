# thewireless

1950 Called. It Wants It's Radio Back.

## About

This program can be run on a Raspberry Pi (or compatible) to turn it into a hardware controlled internet radio. It's intended to use an MCP3x0x ADC (e.g. MCP3004) to read analogue controls for volume, channel and tone. These will be user-specified in a config file. It's expected to be used on a PoE capable Pi with a [Pimoroni 3W Shim](https://shop.pimoroni.com/products/audio-amp-shim-3w-mono-amp) but should be flexible enough to use with different audio and control layouts with only config changes.

## Prerequisites

First, you'll need a raspberry pi, running a fresh install of raspbian lite, with ssh enabled with known sudo-permitted user credentials, connected to a speaker using an Pirate Audio 3W Shim.

Obviously, the pi will need to be connected to any switches, potentiometers and servos needed. You also need to install nodejs, and install and configure mpd, the Media Player Daemon. Below is provided a lazy copy-paste set of instructions. If you're doing anything non-standard, I'd advise you to take manual control and use general documentation to work out these things.

```
sudo apt install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &&\
sudo apt install -y nodejs mpd
```

If you're running a headless raspbian-lite pi, this may well be all you need to do. If you're trying to do this on a full desktop then you will likely have conflicts with PulseAudio or Pipewire or other modern technologies. Otherwise, look up mpd documentation for how to configure it. It's also useful to do the following:

```
sudo apt install mpc
```

To get MPC, the Media Player Controller - which you can use with any audio file to test your audio settings from  an ssh terminal - in order to rule out 