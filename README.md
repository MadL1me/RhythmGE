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

## OS Compability
* Windows
* MacOS
* Linux
* Any OS With modern web browser (cooming soon)

## How to help project and contribute
The more stars project have, the more chance what other rhythm game developers will save their time by using this tool, by finding it on internet/github, and help with 
project development with their unique ideas and siggestions.

I'll be glad if you review my code in any way, especcialy in archetecutre deisgn,
because i'm not very experienced with typescript (actually, this is my first timescript project).  

If you somehow can understand my code, you can do any features from TODO for v1.0 release list, there's plenty of them, you can pick whatever you want.

# Contents

## Quick Start
First of all, you can download software here.


Before start editing your beatmap, you must import audio file. Currently its supports audio file formats:
* **.mp3** 
* **.wav** 

After imporing your audio, you now able to edit beatmap.
By clicking with left mouse button on cross beatween BPM and LPB and CLines, you can place timestamps, by holding left mouse button you can select group of grid elements to delete/move/copy etc. 

More info about variuos setting and hotkeys you can find below.

### Editor Settings
#### BPM 
Then you audio file is loaded, you'll see created vertical **BPM** lines, which is used to place elements in beat. In the place where BPM line and LPB line are crossed
you can place your timestamp

#### Offset
Each song usual have a **offset**, which is define how much samples will be offseted in start of first song beat

#### LPB
Verical lines in the editor is **LPB** lines, (Lines Per Beat) which represent total tracks, used to place timestamps. For example, in Guitar Hero there's
6 tracks with notes. Minimum LPB is 1 and Max: 100.

#### Snap Lines
Snap lines is divider for BPM lines, and used to divide zones between beats for BPM lines

Each of the listed variables you can tune on setting tab above editor main timeline.

#### Timestamp Prefabs
Maybe you had mentionaed tab with colored diamonds buttons. That's timestamp prefabs. Each prefab have unique color and ic

#### Hotkeys 
In order to make editing more pleasant, editor currently supports: 

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
You can use existing file reader for varius programming languages and game engines (currently avaible only for C#), which is stored in **/Readers** filder

## TODO for v1.0 release
- [ ] User-creatable timestamp prefabs, with metadata templates
- [ ] Do more canvas and overall app optimisation
- [ ] Changeable user defined hotkeys
- [ ] Changeable UI theme 
- [ ] Modular block system
- [ ] Tool for bpm detecting
- [ ] Auto Bpm detecting
- [ ] Multiple BPM's in one song
- [ ] Zones between CLines
