import pytest
from unittest import mock
from unittest.mock import patch
from llm_queries import query_llm_robust

@patch.object(client.chat.completions, 'create')
def test_unexpected_language(mock_create):
    """Test for handling unexpected language responses."""
    #mock the model's response to return a specific message
    mock_create.return_value.choices = [mock.Mock(message=mock.Mock(content="I don't understand your request"))]

    result = query_llm_robust("Hier ist dein erstes Beispiel.")

    assert result == (False, "Error: Invalid translation response.")

@patch.object(client.chat.completions, 'create')
def test_invalid_translation_response(mock_create):
    """Test for an invalid translation response."""
    mock_create.return_value.choices = [mock.Mock(message=mock.Mock(content=""))]
    result = query_llm_robust("Hier ist dein erstes Beispiel.")
    assert result == (False, "Error: Invalid translation response.")

@patch.object(client.chat.completions, 'create')
def test_exception_handling(mock_create):
    """Test for handling exceptions during processing."""
    mock_create.side_effect = Exception("Service down")
    result = query_llm_robust("Some input")
    assert result == (False, "Error: Unable to process the request.")

@patch.object(client.chat.completions, 'create')
def test_valid_english_input(mock_create):
    """Test for a valid English input."""
    mock_create.return_value.choices = [mock.Mock(message=mock.Mock(content="Expected output"))]
    result = query_llm_robust("This is a test.")
    assert result == (True, "Expected output")  #adjust to expected output
