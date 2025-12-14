# To run this code you need to install the following dependencies:
# pip install google-genai

import base64
import mimetypes
import os
import re
import struct
from google import genai
from google.genai import types


def save_binary_file(file_name, data):
    f = open(file_name, "wb")
    f.write(data)
    f.close()
    print(f"File saved to to: {file_name}")


def generate():
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.5-pro-preview-tts"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""# AUDIO PROFILE: Red Earth Audiobook
## Multi-Speaker Dramatic Narration

## THE SCENE: The American South
The story unfolds across the sweeping red clay fields of the antebellum South, through war and reconstruction. The landscape shifts from golden prosperity to gray ruin, and finally to hard-won recovery. The emotional arc moves from innocence through despair to fierce determination.

### DIRECTOR'S NOTES

**For Narrator:**
Style: Rich, literary Southern storytelling voice. Warm and evocative during the opening pastoral scenes, growing somber and heavy during the war passages, then building to fierce intensity during Maeve's vow. When voicing Sterling's dialogue, shift to a smooth, knowing masculine tone with subtle sardonic warmth.

Pacing: Measured and deliberate, allowing the weight of each image to land. Slow during reflective moments, quickening slightly during conflict, pausing dramatically before Maeve's famous vow.

Accent: Refined Southern American, reminiscent of old Georgia gentry.

**For Maeve:**
Style: Young Southern belle transformed by hardship. Her single line must convey desperate hunger, iron will, and fierce defiance all at once. This is her defining moment of transformation from pampered girl to survivor.

Pacing: Slow, deliberate, building in intensity. Each word is a vow carved in stone.

Accent: Classic Southern belle from Georgia plantation society.

---

### TRANSCRIPT

Narrator: The Red Earth's Promise.

Narrator: The red fields of Oakhaven stretched wide, a kingdom held together by rich earth and the swift will of Miss Maeve. She stood amidst the summer glow, accustomed to admiration, accustomed to ease. The world was ordered, beautiful, and utterly her own.

Narrator: But the gentle, golden afternoon turned harsh and gray. Conflict, a distant storm once sung in polite parlors, swept across the landscape, shattering the delicate glass of their lives. Oakhaven's coffers emptied faster than the fields turned fallow.

Narrator: When she returned, the grand house, her beloved Oakhaven, was scarred. Silence had replaced the laughter, and the rich earth seemed to weep dust. Everything was gone but the chimney smoke... and her own stubborn breath.

Narrator: The gnawing hunger was worse than the sight of ruin. It was a physical, terrifying adversary. Maeve watched her family fade, realizing that beauty and lineage meant nothing against the stark reality of an empty stomach.

Narrator: She crawled to the edge of the property, grasping a handful of the sacred, blood-red soil. Her fists were clenched, not just with dirt, but with iron resolve.

Maeve: As God is my witness... I shall never be hungry again.

Narrator: The survival meant sacrificing elegance for shrewdness. She learned to scheme, to bargain, and to wield charm like a sharp, hidden dagger. Oakhaven would not fall, not because of good manners, but because of good, hard business.

Narrator: She built her foundation on the very things polite society now deemed unsuitable: lumber, profit, and the swift exploitation of opportunity. The fields remained sacred, but their value lay now in their ability to shelter an enterprise.

Narrator: Sterling told her, lighting a cigar slowly, with knowing amusement in his voice: \"You have the courage of a dozen captains. But your love for that piece of dirt blinds you to the greater world. You confuse possession with happiness.\"

Narrator: Oakhaven stood strong once more, painted and proud, bought and paid for by Maeve's fierce persistence. But sitting in her restored parlor, she realized the land she saved had cost her pieces of her own soul... and the simple joy she once sought.

Narrator: Yet, the resilience remained. That burning, defiant core that had gripped the red earth refused to break. She had lost much, but she knew how to survive, and she knew, absolutely, how to begin again. The horizon waited, wide and uncertain, demanding her resolve."""),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        response_modalities=[
            "audio",
        ],
        speech_config=types.SpeechConfig(
            multi_speaker_voice_config=types.MultiSpeakerVoiceConfig(
                speaker_voice_configs=[
                    types.SpeakerVoiceConfig(
                        speaker="Narrator",
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name="Charon"
                            )
                        ),
                    ),
                    types.SpeakerVoiceConfig(
                        speaker="Maeve",
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name="Aoede"
                            )
                        ),
                    ),
                ]
            ),
        ),
    )

    file_index = 0
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if (
            chunk.candidates is None
            or chunk.candidates[0].content is None
            or chunk.candidates[0].content.parts is None
        ):
            continue
        if chunk.candidates[0].content.parts[0].inline_data and chunk.candidates[0].content.parts[0].inline_data.data:
            file_name = f"ENTER_FILE_NAME_{file_index}"
            file_index += 1
            inline_data = chunk.candidates[0].content.parts[0].inline_data
            data_buffer = inline_data.data
            file_extension = mimetypes.guess_extension(inline_data.mime_type)
            if file_extension is None:
                file_extension = ".wav"
                data_buffer = convert_to_wav(inline_data.data, inline_data.mime_type)
            save_binary_file(f"{file_name}{file_extension}", data_buffer)
        else:
            print(chunk.text)

def convert_to_wav(audio_data: bytes, mime_type: str) -> bytes:
    """Generates a WAV file header for the given audio data and parameters.

    Args:
        audio_data: The raw audio data as a bytes object.
        mime_type: Mime type of the audio data.

    Returns:
        A bytes object representing the WAV file header.
    """
    parameters = parse_audio_mime_type(mime_type)
    bits_per_sample = parameters["bits_per_sample"]
    sample_rate = parameters["rate"]
    num_channels = 1
    data_size = len(audio_data)
    bytes_per_sample = bits_per_sample // 8
    block_align = num_channels * bytes_per_sample
    byte_rate = sample_rate * block_align
    chunk_size = 36 + data_size  # 36 bytes for header fields before data chunk size

    # http://soundfile.sapp.org/doc/WaveFormat/

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",          # ChunkID
        chunk_size,       # ChunkSize (total file size - 8 bytes)
        b"WAVE",          # Format
        b"fmt ",          # Subchunk1ID
        16,               # Subchunk1Size (16 for PCM)
        1,                # AudioFormat (1 for PCM)
        num_channels,     # NumChannels
        sample_rate,      # SampleRate
        byte_rate,        # ByteRate
        block_align,      # BlockAlign
        bits_per_sample,  # BitsPerSample
        b"data",          # Subchunk2ID
        data_size         # Subchunk2Size (size of audio data)
    )
    return header + audio_data

def parse_audio_mime_type(mime_type: str) -> dict[str, int | None]:
    """Parses bits per sample and rate from an audio MIME type string.

    Assumes bits per sample is encoded like "L16" and rate as "rate=xxxxx".

    Args:
        mime_type: The audio MIME type string (e.g., "audio/L16;rate=24000").

    Returns:
        A dictionary with "bits_per_sample" and "rate" keys. Values will be
        integers if found, otherwise None.
    """
    bits_per_sample = 16
    rate = 24000

    # Extract rate from parameters
    parts = mime_type.split(";")
    for param in parts: # Skip the main type part
        param = param.strip()
        if param.lower().startswith("rate="):
            try:
                rate_str = param.split("=", 1)[1]
                rate = int(rate_str)
            except (ValueError, IndexError):
                # Handle cases like "rate=" with no value or non-integer value
                pass # Keep rate as default
        elif param.startswith("audio/L"):
            try:
                bits_per_sample = int(param.split("L", 1)[1])
            except (ValueError, IndexError):
                pass # Keep bits_per_sample as default if conversion fails

    return {"bits_per_sample": bits_per_sample, "rate": rate}


if __name__ == "__main__":
    generate()
