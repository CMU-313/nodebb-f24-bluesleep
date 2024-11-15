import pytest
from unittest import mock
from unittest.mock import patch
from translator import query_llm_robust  

#mocking the LLM API response for normal response
@patch('translator.llm_queries.query_llm_robust')  
def test_llm_normal_response(mock_query_llm_robust):
    #define the expected LLM response
    expected_response = (False, "Here is your first example.")
    mock_query_llm_robust.return_value = expected_response
    
    #call the function under test
    result = query_llm_robust("Hier ist dein erstes Beispiel.")
    
    #validate the result
    assert result == expected_response

#mocking the LLM API response for gibberish response
@patch('translator.llm_queries.query_llm_robust') 
def test_llm_gibberish_response(mock_query_llm_robust):
    #define the expected LLM response for gibberish input
    expected_response = (False, "Error: Invalid translation response.")
    mock_query_llm_robust.return_value = expected_response
    
    #call the function under test
    result = query_llm_robust("sdflkjqwepoijqwe")  #gibberish input
    
    #validate the result
    assert result == expected_response
