import edge_tts

# Common high quality Spanish voices from Edge TTS
VOICES = [
    {"id": "es-ES-AlvaroNeural", "name": "Álvaro (España) - Hombre"},
    {"id": "es-ES-ElviraNeural", "name": "Elvira (España) - Mujer"},
    {"id": "es-MX-DaliaNeural", "name": "Dalia (México) - Mujer"},
    {"id": "es-MX-JorgeNeural", "name": "Jorge (México) - Hombre"},
    {"id": "es-AR-ElenaNeural", "name": "Elena (Argentina) - Mujer"},
    {"id": "es-AR-TomasNeural", "name": "Tomás (Argentina) - Hombre"},
    {"id": "es-CO-GonzaloNeural", "name": "Gonzalo (Colombia) - Hombre"},
    {"id": "es-CO-SalomeNeural", "name": "Salomé (Colombia) - Mujer"}
]

def get_available_voices():
    return VOICES

async def text_to_speech(text, output_file, voice="es-ES-AlvaroNeural"):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)
