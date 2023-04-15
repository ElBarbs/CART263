# Playful Interaction - Barbier Louis, Thompson Jaden

## Prototype

- We wanted to track people and create sound based on their position and movement.

### From Prototype to Final Project

- We abandoned PoseNet, a pre-trained model that allows for real-time pose detection, due to various limitations with accuracy while tracking multiple people.
- We introduced a new method of tracking using Object Classification (COCO-SSD).
- We oriented ourselves towards a more abstract visual representation.
- We discussed and tested what object would work best for tracking and would incite experimentation for the viewers.

### Moodboard for Vizualization

#### Radio Pulsar Data Plots

![Radio Pulsar Data Plots](https://github.com/ElBarbs/CART263/blob/main/Project%203/assets/documentation/radioPulsar.png?raw=true)

#### Belousov-Zhabotinsky Reactions

![Belousov-Zhabotinsky Reactions](https://github.com/ElBarbs/CART263/blob/main/Project%203/assets/documentation/belousovZhabotinsky.png?raw=true)

#### Vib-Ribbon

![Vib-Ribbon](https://github.com/ElBarbs/CART263/blob/main/Project%203/assets/documentation/vibRibbon.png?raw=true)

## Final Project

- An interactive installation that allows the viewer to experiment with different objects to create sound.

![Final Project](https://github.com/ElBarbs/CART263/blob/main/Project%203/assets/documentation/finalProject.png?raw=true)

### Technical Description

- We are using COCO-SSD, which is a pre-trained object detection model that can be used to locate and identify objects in images or videos. It can detect 80 different classes of objects.
- We associated different note patterns to 9 classes we thought would work the best for our project. They had to be objects that would be easily trackable and would incite experimentation from the viewers.
  - Potted Plant.
  - Book.
  - Vase.
  - Bottle.
  - Cell Phone.
  - Apple.
  - Banana.
  - Fork.
  - Knife.
- Each sound is generated using a mono-synth from the p5.sound library. The synth is triggered when the object is detected.
- A radial graph represents the frequencies of the sounds being played. Its size is proportional to the number of objects being tracked.

### Future of the Project

- Change the color of the radial graph based on the objects being tracked.
- Change the sound of the objects to have more unique sound loops and octaves.
- Create a visual indicator to incitate the viewer to play with the objects.
