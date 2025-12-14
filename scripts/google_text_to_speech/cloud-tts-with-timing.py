"""
Google Cloud Text-to-Speech script with timing metadata for page synchronization.
Uses Standard voices (free tier: 4M characters/month).

Requirements:
    pip install google-cloud-texttospeech pydub

Setup:
    1. Enable Cloud Text-to-Speech API in Google Cloud Console
    2. Create a service account and download JSON key
    3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable:
       export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

Usage:
    python cloud-tts-with-timing.py
"""

import json
import os
import wave
from pathlib import Path
from google.cloud import texttospeech


def get_wav_duration(file_path: str) -> float:
    """Get duration of a WAV file in seconds."""
    with wave.open(file_path, 'rb') as wav_file:
        frames = wav_file.getnframes()
        rate = wav_file.getframerate()
        return frames / float(rate)


def synthesize_text(client: texttospeech.TextToSpeechClient,
                    text: str,
                    output_path: str,
                    voice_name: str = "en-US-Standard-D") -> float:
    """
    Synthesize text to speech and save as WAV file.
    Returns duration in seconds.

    Standard voices (free tier):
    - en-US-Standard-A (Female)
    - en-US-Standard-B (Male)
    - en-US-Standard-C (Female)
    - en-US-Standard-D (Male)
    - en-US-Standard-E (Female)
    - en-US-Standard-F (Female)
    - en-US-Standard-G (Female)
    - en-US-Standard-H (Female)
    - en-US-Standard-I (Male)
    - en-US-Standard-J (Male)
    """
    synthesis_input = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name=voice_name,
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.LINEAR16,  # WAV format
        speaking_rate=0.9,  # Slightly slower for narration
        pitch=0.0,
    )

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )

    with open(output_path, "wb") as out:
        out.write(response.audio_content)

    return get_wav_duration(output_path)


def concatenate_wav_files(input_files: list[str], output_path: str):
    """Concatenate multiple WAV files into one."""
    if not input_files:
        return

    # Read first file to get parameters
    with wave.open(input_files[0], 'rb') as first_wav:
        params = first_wav.getparams()

    # Write concatenated file
    with wave.open(output_path, 'wb') as output_wav:
        output_wav.setparams(params)

        for input_file in input_files:
            with wave.open(input_file, 'rb') as input_wav:
                output_wav.writeframes(input_wav.readframes(input_wav.getnframes()))


def generate_narration_with_timing(story_path: str, output_dir: str):
    """
    Generate narration audio with timing metadata.

    Creates:
    - Individual page audio files: page-01.wav, page-02.wav, etc.
    - Combined audio file: full-narration.wav
    - Timing metadata: timing.json
    """
    # Load story
    with open(story_path, 'r') as f:
        story = json.load(f)

    title = story.get('title', 'Story')
    pages = story.get('pages', [])

    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Initialize client
    client = texttospeech.TextToSpeechClient()

    timing_data = {
        "title": title,
        "totalDuration": 0,
        "pages": []
    }

    page_files = []
    current_time = 0.0

    print(f"Generating narration for: {title}")
    print(f"Total pages: {len(pages)}")
    print("-" * 40)

    # Generate title audio first (optional intro)
    title_file = output_path / "page-00-title.wav"
    title_text = f"{title}."
    title_duration = synthesize_text(client, title_text, str(title_file))
    page_files.append(str(title_file))

    timing_data["pages"].append({
        "page": 0,
        "type": "title",
        "start": current_time,
        "end": current_time + title_duration,
        "duration": title_duration
    })
    current_time += title_duration
    print(f"Title: {title_duration:.2f}s")

    # Generate audio for each page
    for page_data in pages:
        page_num = page_data.get('page', 0)
        text = page_data.get('text', '')

        if not text:
            continue

        page_file = output_path / f"page-{page_num:02d}.wav"
        duration = synthesize_text(client, text, str(page_file))
        page_files.append(str(page_file))

        timing_data["pages"].append({
            "page": page_num,
            "type": "content",
            "start": current_time,
            "end": current_time + duration,
            "duration": duration
        })

        print(f"Page {page_num}: {duration:.2f}s (total: {current_time + duration:.2f}s)")
        current_time += duration

    timing_data["totalDuration"] = current_time

    # Save timing metadata
    timing_file = output_path / "timing.json"
    with open(timing_file, 'w') as f:
        json.dump(timing_data, f, indent=2)
    print(f"\nTiming saved to: {timing_file}")

    # Concatenate all audio files
    full_audio_file = output_path / "full-narration.wav"
    concatenate_wav_files(page_files, str(full_audio_file))
    print(f"Full narration saved to: {full_audio_file}")
    print(f"Total duration: {current_time:.2f}s ({current_time/60:.1f} min)")

    return timing_data


if __name__ == "__main__":
    # Paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent

    story_path = project_root / "public" / "data" / "red-earths-promise.json"
    output_dir = project_root / "audio" / "red-earths-promise"

    print(f"Story: {story_path}")
    print(f"Output: {output_dir}")
    print("=" * 40)

    timing = generate_narration_with_timing(str(story_path), str(output_dir))

    print("\n" + "=" * 40)
    print("Timing Summary:")
    print(json.dumps(timing, indent=2))
