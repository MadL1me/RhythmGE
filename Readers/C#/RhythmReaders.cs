using System.Collections.Generic;

namespace RhythmReaders
{
    public class RbmReader
    {
        private string[] _fileLines;
        private int _readPosition;

        public RbmReader(string[] fileLines)
        {
            _fileLines = fileLines;
        }

        public RhythmData GetReadedData()
        {
            RhythmData data = new RhythmData();

            while(_readPosition < _fileLines.Length - 1)
            {
                switch (_fileLines[_readPosition])
                {
                    case "[Timestamps]":
                        data.Timestamps = ReadTimestamps();
                        break;
                }
                _readPosition++;
            }
            
            return data;
        }

        private Timestamp[] ReadTimestamps()
        {
            var timestampsPosition = _readPosition + 1;
            var timestamps = new Timestamp[_fileLines.Length - timestampsPosition];

            for (int i = _fileLines.Length-1; i >= timestampsPosition; i--)
            {
                var lineInfo = _fileLines[i].Split(':');
                
                var time = long.Parse(lineInfo[0]);
                var id = uint.Parse(lineInfo[1]);
                var prefabId = uint.Parse(lineInfo[2]);
                var beatTrackId = uint.Parse(lineInfo[3]);
                var isLong = lineInfo[4] == "1";
                
                var timestamp = new Timestamp(time, id, prefabId, beatTrackId, isLong);

                if (isLong && lineInfo.Length > 5)
                {
                    var connectionsCount = uint.Parse(lineInfo[5]);

                    for (int j = 0; j < connectionsCount; j++)
                    {
                        var connectedId = int.Parse(lineInfo[6 + j]);
                        timestamp.ConnectedTimestamps.Add(timestamps[connectedId]);
                    }
                }

                timestamps[i-timestampsPosition] = timestamp;
            }

            _readPosition = _fileLines.Length;
            return timestamps;
        }
    }

    public class Timestamp
    {
        public readonly long Time;
        public readonly uint Id;
        public readonly uint PrefabId;
        public readonly uint BeatTrackId;
        public readonly bool IsLong;
        public readonly List<Timestamp> ConnectedTimestamps;

        public Timestamp(long time, uint id, uint prefabId, uint beatTrackId, bool isLong)
        {
            Time = time;
            Id = id;
            PrefabId = prefabId;
            BeatTrackId = beatTrackId;
            IsLong = isLong;

            if (isLong)
                ConnectedTimestamps = new List<Timestamp>();
        }
    }

    public struct RhythmData
    {
        public Timestamp[] Timestamps;
    }
}