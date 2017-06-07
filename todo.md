# TODO

* auth
  * bearer tokens maybe
    * could generate via CLI...



### led/buzzer control

* what would be useful:
  * valid touch
  * invalid touch (bad card or bad read)
  * indicate hold/register mode


From ACR122 docs:

```
  led is 8 bits:
     +-----+----------------------------------+-------------------------------------+
     | Bit |               Item               |             Description             |
     +-----+----------------------------------+-------------------------------------+
     |   0 | Final Red LED State              | 1 = On; 0 = Off                     |
     |   1 | Final Green LED State            | 1 = On; 0 = Off                     |
     |   2 | Red LED State Mask               | 1 = Update the State; 0 = No change |
     |   3 | Green LED State Mask             | 1 = Update the State; 0 = No change |
     |   4 | Initial Red LED Blinking State   | 1 = On; 0 = Off                     |
     |   5 | Initial Green LED Blinking State | 1 = On; 0 = Off                     |
     |   6 | Red LED Blinking Mask            | 1 = Blink ; 0 = Not Blink            |
     |   7 | Green LED Blinking Mask          | 1 = Blink ; 0 = Not Blink            |
     +-----+----------------------------------+-------------------------------------+
```

Better description here https://stackoverflow.com/questions/38676069/acr122u-led-controlling

bits 0-3 control what happens after the touch, which doesn't seem to work anyway, but 4-7 control the lights during blinking behaviour.

blinking is four bytes:
  - first duration (x100ms)
  - second duration (x100ms)
  - repetitions
  - beeper control
    - 0: silent
    - 1: beep on first
    - 2: beep on second
    - 3: beep on both


