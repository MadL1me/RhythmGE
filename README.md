![RGE Github Best](https://user-images.githubusercontent.com/46647517/116629762-a7a9b580-a95a-11eb-8b7a-c3e92264b35b.png)

# Description
Rhythm Game Editor is a tool for creating a timestamps for rhythm game developers.

The tool is developed and designed, to handle varius situation an uniqueness of gameplay of any rhythm game, can be developed. It supports diffenet types of timestamps, unique count of LPB lines, good tools like Claps, line following and good editing features. 

The app is built with Electron, and avaible on any operating system, including Windows, MacOS and Linux.

You can Download last stable verison at Release page

![Capture](https://user-images.githubusercontent.com/46647517/116630699-60bcbf80-a95c-11eb-9054-cf4a957610df.PNG)

## Features
* Control of song BPM and song Offset
* Custom Creatable Lines
* Unique timestamps prefabs
* Unified and easy-readable file format
* Long-timestamps support
* Custom count of LPB (beat tracks)
* Supports various of codecs
* Full control for playback rate, seek, volume, etc.
* Claps for feeling the rhythm
* Easy copying and pasting of element groups

## OS Compatibility
* Windows
* MacOS
* Linux
* Any OS With a modern web browser (coming soon)

## How to help project and contribute
The more stars project have, the more chance what other rhythm game developers will save their time by using this tool, by finding it on the internet/GitHub, and help with 
project development with their unique ideas and suggestions.

I'll be glad if you review my code in any way, especially in architecture design,
because I'm not very experienced with typescript (actually, this is my first typescript project).  

If you somehow can understand my code, you can do any features from TODO for v1.0 release list, there's plenty of them, you can pick whatever you want.

# Contents

## Quick Start
First of all, you can download the software here.


Before start editing your beatmap, you must import an audio file. Currently, it supports audio file formats:
* **.mp3** 
* **.wav** 

After importing your audio, you now able to edit beatmap.
By clicking with the left mouse button on the cross between BPM and LPB and CLines, you can place timestamps, by holding the left mouse button you can select a group of grid elements to delete/move/copy, etc. 

More info about various settings and hotkeys you can find below.

### Editor Settings
#### BPM 
Then your audio file is loaded, you'll see created vertical **BPM** lines, which are used to place elements in beat. In the place where BPM line and LPB line are crossed
you can place your timestamp

#### Offset
Each song usual have an **offset**, which is define how many samples will be offset at the start of the first song beat

#### LPB
Horizontal lines in the editor are **LPB** lines, (Lines Per Beat) which represent total tracks, used to place timestamps. For example, in Guitar Hero there's
6 tracks with notes. Minimum LPB is 1 and Max: 100.

#### Snap Lines
Snap lines is a divider for BPM lines and used to divide zones between beats for BPM lines

Each of the listed variables you can tune on the setting tab above the editor's main timeline.

#### Timestamp Prefabs
Maybe you had mentioned a tab with colored diamond buttons. That's timestamp prefabs. Each prefab have unique color and ic

#### Hotkeys 
To make editing more pleasant, the editor currently supports: 

Hotkey | Action
-------|-------
Ctrl+Mouse scroll | Change canvas scale
Shift+Mouse scroll | Fast scrolling
Num 1-9 | Select Timestamp prefab with ID
QWERTY | Create CLine with timestamp at 1-5
Space | Create CLine
Ctrl+S | Save beatmap file
Ctrl+C | Copy Grid Elements
Ctrl+V | Paste Grid Elements
Ctrl+X | Virezat Grid Elements
Ctrl+Z | Undo last action
Ctrl+Y | Undo undoing last action
Ctrl+R | Move to audio Start
S | Play/Pause audio



## File Format Specification


### File Readers
You can use existing file reader for various programming languages and game engines (currently available only for C#), which is stored in **/Readers** folder

## TODO for v1.0 release
- [ ] User-creatable timestamp prefabs, with metadata templates
- [ ] Do more canvas and overall app optimisation
- [ ] Changeable user defined hotkeys
- [ ] Changeable UI theme 
- [ ] Modular block system
- [ ] Tool for bpm detecting
- [ ] Auto Bpm detecting
- [ ] Multiple BPM's in one song
