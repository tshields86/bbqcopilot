import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Check, MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Button, Card, FlameLoader } from '@/components/ui';
import type { ClarificationQuestion } from '@/lib/types';

interface ClarificationAnswer {
  question: ClarificationQuestion;
  answer: string;
}

interface ClarificationChatProps {
  questions: ClarificationQuestion[];
  answers: ClarificationAnswer[];
  onAnswer: (question: ClarificationQuestion, answer: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function ClarificationChat({
  questions,
  answers,
  onAnswer,
  onSubmit,
  isLoading,
}: ClarificationChatProps) {
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});

  const getAnswer = (questionId: string): string | undefined => {
    return answers.find((a) => a.question.id === questionId)?.answer;
  };

  const allQuestionsAnswered = questions.every((q) => getAnswer(q.id));

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-4">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4">
        <MessageCircle size={20} color="#B87333" />
        <Text className="font-display text-lg text-ash-white">A few quick questions...</Text>
      </View>

      {/* Questions */}
      <View className="gap-4 mb-6">
        {questions.map((question) => {
          const currentAnswer = getAnswer(question.id);

          return (
            <Card key={question.id} variant="outlined">
              <Text className="font-body-semibold text-base text-ash-white mb-3">
                {question.question}
              </Text>

              {question.type === 'choice' && question.options ? (
                <View className="gap-2">
                  {question.options.map((option) => {
                    const isSelected = currentAnswer === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => onAnswer(question, option)}
                        className={`
                          flex-row items-center p-3 rounded-lg border
                          ${
                            isSelected
                              ? 'border-ember-red bg-ember-red/10'
                              : 'border-char-500/30 bg-char-black/30'
                          }
                        `}
                      >
                        <View
                          className={`
                            w-5 h-5 rounded-full border-2 mr-3 items-center justify-center
                            ${isSelected ? 'border-ember-red bg-ember-red' : 'border-char-500/50'}
                          `}
                        >
                          {isSelected && <Check size={12} color="#F5F5F0" />}
                        </View>
                        <Text
                          className={`font-body text-sm ${isSelected ? 'text-ash-white' : 'text-char-300'}`}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View>
                  <TextInput
                    className="font-body text-base text-ash-white bg-char-black/30 border border-char-500/30 rounded-lg p-3"
                    placeholder={
                      question.type === 'number' ? 'Enter a number...' : 'Type your answer...'
                    }
                    placeholderTextColor="#4A4A4A"
                    value={textInputs[question.id] || currentAnswer || ''}
                    onChangeText={(text) => {
                      setTextInputs((prev) => ({ ...prev, [question.id]: text }));
                    }}
                    onBlur={() => {
                      const text = textInputs[question.id];
                      if (text) {
                        onAnswer(question, text);
                      }
                    }}
                    keyboardType={question.type === 'number' ? 'numeric' : 'default'}
                  />
                </View>
              )}
            </Card>
          );
        })}
      </View>

      {/* Loading indicator */}
      {isLoading && (
        <View className="items-center py-4">
          <FlameLoader size="sm" />
          <Text className="font-body text-sm text-char-300 mt-2">Processing your answers...</Text>
        </View>
      )}

      {/* Submit */}
      {!isLoading && (
        <Button
          variant="primary"
          size="lg"
          onPress={onSubmit}
          disabled={!allQuestionsAnswered}
          fullWidth
        >
          {allQuestionsAnswered ? 'Generate My Recipe' : 'Answer all questions to continue'}
        </Button>
      )}
    </ScrollView>
  );
}
