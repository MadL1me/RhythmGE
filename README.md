![RGE Github Best](https://user-images.githubusercontent.com/46647517/116629762-a7a9b580-a95a-11eb-8b7a-c3e92264b35b.png)

# Description
Rhythm Game Editor is a tool for creating timestamps for rhythm game developers.

The tool is developed and designed, to handle various situations and the uniqueness of gameplay of any rhythm game can be developed. It supports different types of timestamps, a unique count of LPB lines, handy tools like сlaps to feel the rhythm, line-following, timeline scaling, and convenient editing features.

The app is built with Electron, and available on any operating system, including Windows, macOS, and Linux.

You can download the last stable version at the Release page

![Capture](https://user-images.githubusercontent.com/46647517/116630699-60bcbf80-a95c-11eb-9054-cf4a957610df.PNG)

## Features
* Control of song BPM and song Offset
* Custom Creatable Lines
* Unique timestamps prefabs
* Unified and easy-readable file format
* Long-timestamps support (Long-notes)
* Custom count of LPB (beat tracks)
* Supports various of codecs
* Full control for playback rate, seek, volume, etc.
* Claps for feeling the rhythm

## OS Compatibility
* Windows
* MacOS
* Linux
* Any OS With a modern web browser (coming soon)

## How to help project and contribute
The more stars project have, the more chance what other rhythm game developers will save their time by using this tool, by finding it on the internet/GitHub, and help with 
project development with their unique ideas and suggestions.

I'll be glad if you review my code in any way, especially in architecture design,

Also you can do any features from TODO for v1.0 release list, there's plenty of them, you can pick whatever you want.

## Quick Start
First of all, you can download the software here.

Before start editing your beatmap, you must import an audio file. Currently, it supports audio file formats:
* **.mp3** 
* **.wav** 

After importing your audio, you now able to edit beatmap.
By clicking with the left mouse button on the cross between **BPM** and **LPB** or **LPB* and **CLines**, you can place timestamps, by holding the left mouse button you can select a group of grid elements to delete/move/copy, etc. You can change song position by clicking on top line of editor.

More info about various settings and hotkeys you can find below.

### Editor Settings and terminology
#### BPM 
Then your audio file is loaded, you'll see created vertical **BPM** lines, which are used to place elements in beat. In the place where BPM line and LPB line are crossed
you can place your timestamp.

#### Offset
Each song usual have an **offset**, which is define how many samples will be offset at the start of the first song beat

#### LPB
Horizontal lines in the editor are **LPB** lines, (Lines Per Beat) which represent total tracks, used to place timestamps. For example, in Guitar Hero there's
6 tracks with notes. Minimum LPB is 1 and Max: 100.

#### Snap lines
Snap lines is a divider for BPM lines and used to divide zones between beats for BPM lines

### Follow lines
By checking this checkbox, your camera will follow timestamp line.

## Use claps
By checking this checkbox, the sound of clap will play then timestamp line crosses over timestamps.

Each of the listed variables you can tune on the setting tab above the editor's main timeline.

### Timestamp 
Timestamp is the central object of entire editor. Timestamp represent some event accured on exact time. So, timestamp is not like "note", by selecting different timestamp prefabs (Buttons with diamonds inside), you can place different types of timestamps which will allow you to use this timing in whatever way you want. For example, you may make default notes with green timestamps, 2x speed increase on red timestamp, slow down x2 with purple timestamp and so on.

### CLine 
CLine (Creatable Line) is a line which you can create by pressing **Space** or 1-5 num keys. CLines allows you to make bpm-free timestamps, by placing CLines and timestamps on it without being attached to BPM lines. So if you lazy to tune bpm (as i do) or you song have a lot of different BPM values, you can use CLines. As with timestamps, you can delete them and move them. Also you can use them to detect BPM by pressing space in rhythm and tuning BPM values to fit CLines.

#### Timestamp Prefabs
Maybe you had mentioned a tab with colored diamond buttons. That's timestamp prefabs. Each prefab have unique color and id.

#### Hotkeys 
To make editing more pleasant, the editor currently supports: 

Hotkey | Action
-------|-------
Ctrl+Mouse Wheel | Change canvas scale
Shift+Mouse Wheel | Fast scrolling
Num 1-6 | Create CLine with timestamp at 1-5
Space | Create CLine
Ctrl+Z | Undo last action
Ctrl+Y | Undo undoing last action
Ctrl+R | Move to audio Start

## File Format Specification
The main file format used in a project is **.rbm** (states for Rhythm Beatmap)
Timestamp info inserted line by line, each line for one timestamp.
There's 4 required and 3 optional params.
- Time in milliseconds - long uint
- TimestampID - uint
- PrefabID - uint
- LPBTrackID - uint
- LongTimestamp - boolean, optional, used then timestamp is long
- ConnectedTimestampsCount - int, optional, used then timestamp is long
- NextTimestampID - uint, optional used to refer to timestampID then timestamp is long

```
[Timestamps]
Time:TimestampID:PrefabID:LPBTrackID <- Single Timestamps
Time:TimestampID:PrefabID:LPBTrackID:LongNote?:NextTimestampID? <- Long Timestamps
...

[Timestamps] <- Key word for timestamps section start
100:0:0:0 <- 100 milliseconds, id=0, prefab id = 0, isLong = false
120:1:1:5:1:1:4 <- 120 milliseconds, id=1, prefab id = 4, lpbID=1, longTimestamp = true, connectedCount = 1, nextTimestampId=4
130:2:4:0
130:3:5:0
135:4:0:1
140:5:0:0 <- The end of long note, started from note with id = 1
```

### File Readers
You can use existing file reader for various programming languages and game engines (currently available only for C#), which is stored in **/Readers** folder.

## TODO for v1.0 release
- [ ] User-creatable timestamp prefabs, with metadata templates
- [ ] Do more canvas and overall app optimisation
- [ ] Changeable user defined hotkeys
- [ ] Changeable UI theme 
- [ ] Modular block system
- [ ] Tool for bpm detecting
- [ ] Auto Bpm detecting
- [ ] Multiple BPM's in one song

Distributed under MIT License. 
