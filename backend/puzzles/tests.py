from django.test import TestCase
from .models import Question
from .serializer import QuestionSerializer


# Create your tests here.
class QuestionSerializerTest(TestCase):
    def test_question_serialization(self):
        # Create a question example
        question = Question(
            question_id=3,
            question_type='WEB',
            description='Sample question',
            timer=30,
            flag='sample_flag',
            start_time='2023-10-16 11:48:56'
        )

        # Serialize the question example
        serializer = QuestionSerializer(question)

        # Verify the data after serialization
        expected_data = {
            'question_id': 3,
            'question_type': 'WEB',
            'description': 'Sample question',
            'timer': 30,
            'flag': 'sample_flag',
            'start_time': '2023-10-16 11:48:56'
        }
        self.assertEqual(serializer.data, expected_data)
