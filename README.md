# 1950called

1950 Called. It Wants It's Radio Back.

## About

This program can be run on a Raspberry Pi (or compatible) to turn it into a hardware controlled internet radio. It's intended to use an MCP3x0x ADC (e.g. MCP3004) to read analogue controls for volume, channel and tone. These will be user-specified in a config file. It's expected to be used on a PoE capable Pi with a [Pimoroni 3W Shim](https://shop.pimoroni.com/products/audio-amp-shim-3w-mono-amp) but should be flexible enough to use with different audio and control layouts with only config changes.

## Prerequisites

Obviously, the pi will need to be connected to any switches, potentiometers and servos needed. There are also library dependencies:

```
sudo apt install libasound2-dev
```