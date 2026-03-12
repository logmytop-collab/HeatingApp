import gpiod
from time import sleep
import os
import json
from paho.mqtt.client import Client

username = "markus"
pwd = "markus"
topic = "pinctrl"
portal_id = "Icke"
# mqtt_broker = "localhost"
mqtt_broker = "mosquitto"

print("starting mqtt2pythongpio")

LED_PIN = 17
chip = gpiod.Chip('gpiochip4')

def on_message(client, userdata, msg):
   print("on message")   
   parameter = msg.payload.decode().split(' ')
   print(f"count parameter {len(parameter)}")
   print(f"parameter pin 1 {parameter[0]}")
   print(f"parameter hight/low 2 {parameter[1]}")
   print(f"parameter time 3 {parameter[2]}")
   pin = int(parameter[0])
   high = parameter[1] == "h"
   low = parameter[1] == "l"
   delay = float(parameter[2]) / 1000
   if ( not (high or low) ):
      print("Neither hight or low \n")
      return
   led_line = chip.get_line(LED_PIN)
   led_line.request(consumer="LED", type=gpiod.LINE_REQ_DIR_OUT)
   if (low):
      led_line.set_value(0)
      print("line " + pin + " was set low ")
      return
   if (high):
      led_line.set_value(1)
   sleep(delay)
   led_line.set_value(0)
   print(f"line {pin} was set high for {delay} sec ")
   led_line.release()

client = Client("Python GPIO")
client.username_pw_set(username, pwd)
print(f"Broker `{mqtt_broker}`")
client.connect(mqtt_broker, port = 1883)

client.subscribe(topic)
client.on_message = on_message
print("all good connected")

client.loop_start()

while True:
   sleep(1)

# LED_PIN = 17

# chip = gpiod.Chip('gpiochip4')
# led_line = chip.get_line(LED_PIN)
# led_line.request(consumer="LED", type=gpiod.LINE_REQ_DIR_OUT)

# try:
#    while True:
#        led_line.set_value(1)
#        sleep(0.5)
#        led_line.set_value(0)
#        print("printing line\n")
# finally:
#    led_line.release()

