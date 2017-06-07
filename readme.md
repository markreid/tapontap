# TapOnTap

Cheers a beer in [OnTap](https://github.com/commoncode/ontap) by touching an NFC token on a USB reader at the bar.


### Usage

Touch a valid NFC token on the reader once to Cheers the designated Keg. Once you've linked your token to your OnTap account, touches will be converted into Cheerses. You can touch before you register your token - any past touches will be linked with your account once you've registered.

TapOnTap attempts to send each touch to OnTap as they come in, but in the case of a network failure, it stores them locally until they can be synchronised.


### Install, configure and run

This has been tested and works as-is on MacOS.

Getting it to run on a Raspberry Pi (Raspbian) involves a few more steps, [documented here](docs/raspberrypi.md).

```
npm install
cp .env.example .env
# edit .env to configure
npm start
```

### Network Connectivity

For simple Tap-to-Cheers functionality, TapOnTap just needs to be able to reach your OnTap instance.

For functionality that requires Ontap to read cards (ie card registration), OnTap has to reach TapOnTap. If you're behind a router/firewall, a quick'n'dirty hack is to open a reverse SSH tunnel:

```
# from your TapOnTap instance to your OnTap instance
ssh -R 5000:localhost:5000 user@yourontapserver

# TapOnTap now reachable on localhost:5000 of your OnTap instance
```

There are a couple of API endpoints for testing connectivity:

* `tapontap:/api/v1/ping` confirms you can reach TapOnTap
* `tapontap:/api/v1/pingontap` confirms that TapOnTap can reach OnTap
* `ontap:/api/v1/ping` confirms you can reach OnTap
* `ontap:/api/v1/pingtapontap` confirms OnTap can reach TapOnTap



### Hardware

Tested with an [ACS ACR-122](http://www.acs.com.hk/en/products/3/acr122u-usb-nfc-reader/) on MacOS and Raspbian. Under the hood it's using Martin Endler's [nfc-pcsc](https://github.com/pokusew/nfc-pcsc) so it should work with whatever readers that library supports.

It doesn't do anything tricky with the tokens apart from attempt to read their uid, so the most basic gear should work there too.

Note [these instructions](docs/raspberrypi.md) for getting the ACR122 to run on Linux.

#### ACR122 LED and Buzzer control
