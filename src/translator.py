import os
from openai import AzureOpenAI
import langdetect

#initialize the Azure OpenAI client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),  #use environment variable for the API key
    api_version="2024-02-15-preview",
    azure_endpoint="https://bluesleep-ai.openai.azure.com/"
)

def translate(content: str) -> tuple[bool, str]:
    """
    Translate non-English text into English using Azure OpenAI model.
    Returns a tuple (is_english, translated_content).
    """
    #check if the content is already in English
    language_type = get_language(content)
    
    #if the content is detected as English, return it as-is
    if language_type == "English":
        return (True, content)

    #if the content is non-English, proceed with translation
    translated_text = get_translation(content)
    return (False, translated_text)

def get_translation(post: str) -> str:
    """Translate non-English text into English using Azure OpenAI model."""
    context = "Please translate the following text into English:"
    prompt = f"{context}\n{post}"

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        if response.choices:
            translation = response.choices[0].message.content.strip()
            #clean up the response to only get the translation
            if "translation of" in translation:
                return translation.split("is")[-1].strip()  # Extract the actual translation part
            return translation
        else:
            return "Error: No choices returned from the model."
    except Exception as e:
        return f"Error in translation: {str(e)}"

def get_language(post: str) -> str:
    """
    Classify the input text as 'English' or 'Non-English' using LLM.
    Returns 'English' if detected as English, otherwise 'Non-English'.
    """
    context = "Classify the following text as 'English' or 'Non-English'. Respond with only 'English' or 'Non-English'."
    prompt = f"{context}\n{post}"

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        if response.choices:
            classification = response.choices[0].message.content.strip().lower()
            if classification in ["english", "non-english"]:
                return classification.capitalize()  #capitalize to match the format
            else:
                return "Error: Invalid classification response"
        else:
            return "Error: No choices returned from the model."

    except Exception as e:
        return f"Error in classification: {str(e)}"
