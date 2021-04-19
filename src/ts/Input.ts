import { Editor } from "./Editor";
import { Slider } from "./Utils";
import { Vec2 } from "./Vec2";

import $ from 'jquery';

export class Input {
    
    editor: Editor;

    private snapSlider = new Slider('snap-lines');
    private volumeSlider = new Slider('volume-slider');
    private playbackSlider = new Slider('playback-rate');

    private lastMousePosition = new Vec2(0,0)
    mousePosition = new Vec2(0,0);
    keysPressed = [];
    
    constructor(editor: Editor) {
        this.editor = editor;

        $('#files').on('change', (event) => { this.onAudioLoad(event); });

        $(window).on('resize', (event) => { this.editor.onWindowResize(event); });
        $(window).on('keydown', (event) => { this.onCanvasKeyDown(event);});
        $(window).on('keyup', (event) => { this.onCanvasKeyUp(event);});

        $('#editor-canvas').on('wheel', (event) => { this.onCanvasWheel(event.originalEvent);})
        .on('click', (event) => { editor.canvasClickHandle(event);})
        .on('mousemove', (event) => { this.onCanvasHover(event);});
        
        $('#play-button').on('click', (event) => {this.playButtonClick(event.target)})

        $('#follow-line').on('change', (event) => { this.onFollowLineChange(event); })
        $('#use-claps').on('change', (event) => { this.onUseClapsValueChange(event); })
        $('#hide-bpm').on('change', (event) => { this.onHideBpmLinesChange(event); })
        $('#hide-creatable').on('change', (event) => { this.onHideCreatableLinesChange(event); })
        $('#beat-lines').on('change', (event) => { this.onBeatLinesValueChange(event); })
        $('#bpm').on('change', (event) => { this.onBpmValueChange(event); })
        $('#offset').on('change', (event) => { this.onOffsetValueChange(event); })

        this.volumeSlider.setValue(0.5);
        this.playbackSlider.setValue(1);
        this.snapSlider.setValue(1);
        
        this.volumeSlider.onValueChange.addListener((value) => {this.onVolumeSliderValueChange(value); });
        this.playbackSlider.onValueChange.addListener((value) => { this.onPlaybackRateValueChange(value); });
        this.snapSlider.onValueChange.addListener((value) => { this.onSnapSliderValueChange(value); });
    }

    isMouseMoved() : boolean {
        return this.lastMousePosition == this.mousePosition;
    }

    update() {
        this.lastMousePosition = this.mousePosition;
    }

    onAudioLoad(event) {
        var files = event.target.files;
        var file = files[0];
        this.editor.onAudioLoad(file.name, file.path);
        console.log(files[0]);
    }
    
    onVolumeSliderValueChange(value: string) {
        var val = parseFloat(value);
        this.editor.audioPlayer.setVolume(val);
    }

    onSnapSliderValueChange(value: string) {
        var val = parseInt(value);
        val = Math.pow(2, val);
        $('#snap-lines-text')[0].innerText = 'Snap lines 1/' + val.toString();
        this.editor.editorGrid.setSnapValue(val);
    }

    onCanvasHover(event) {
        this.mousePosition = new Vec2(event.clientX, event.clientY);
    }

    onPlaybackRateValueChange(value: string) {
        var val = parseFloat(value);
        $('#playback-rate-text')[0].innerText =  'Playback rate ' + val.toString() + 'x';
        this.editor.audioPlayer.setPlaybackRate(val);
    }

    playButtonClick(btn) {
        this.editor.onPlayButtonClick(btn);   
    }

    onCanvasKeyDown(event) {
        event.preventDefault();
        this.keysPressed[event.key] = true;
        if (event.code == 'Space')
            this.editor.createCustomBpmLine();
        if (event.code == 'Alt')
            this.editor.canvasPlacePhantomElementHandler();
        console.log('Key pressed!' + event.key);
    }

    onCanvasKeyUp(event) {
        delete this.keysPressed[event.key];
        console.log('Key removed' + event.key);
        this.editor.drawEditor();
    }

    onCanvasWheel(event) {
        if (this.keysPressed['Control'])
            this.editor.onCanvasResize(parseInt(event.deltaY));
        else if (this.keysPressed['Shift'])
            this.editor.onCanvasScroll(parseInt(event.deltaY), true);
        else
            this.editor.onCanvasScroll(parseInt(event.deltaY), false); 
    }

    onBeatLinesValueChange(event) {
        console.log(event);
        this.editor.changeBeatlinesCount(event);
    }

    onBpmValueChange(event) {
        console.log(event);
        this.editor.changeBpmValue(event);
    }

    onOffsetValueChange(event) {
        console.log(event);
        this.editor.changeOffset(event);
    }

    onUseClapsValueChange(event) {
        console.log(event);
        this.editor.usingClaps = true;
    }

    onHideBpmLinesChange(event) {
        this.editor.hideBpmLines = event.target.checked;
        console.log(event);
    }

    onFollowLineChange(event) {
        this.editor.followingLine = event.target.checked;
        console.log(event);
    }

    onHideCreatableLinesChange(event) {
        this.editor.hideCreatableLines = event.target.checked
        console.log(event);
    }
}
