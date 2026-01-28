import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { AlertCircle, BookmarkPlus, Check } from 'lucide-react-native';
import { useGrills, getPrimaryGrill, useSaveRecipe } from '@/hooks';
import { useCook } from '@/contexts/CookContext';
import { GrillSelector, CookInput, ClarificationChat, GeneratingView } from '@/components/cook';
import { RecipeView } from '@/components/recipe';
import { Button, Card, FlameLoader, H2, Body } from '@/components/ui';
import { formatResetDate } from '@/lib/api';

export default function CookScreen() {
  const router = useRouter();
  const { data: grills, isLoading: grillsLoading } = useGrills();
  const saveRecipeMutation = useSaveRecipe();
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null);
  const {
    step,
    selectedGrill,
    userInput,
    questions,
    answers,
    isAskingQuestions,
    isGenerating,
    streamedContent,
    recipe,
    error,
    rateLimitError,
    setSelectedGrill,
    setUserInput,
    startClarification,
    answerQuestion,
    generateRecipeFromAnswers,
    reset,
  } = useCook();

  const handleSaveRecipe = async () => {
    if (!recipe || savedRecipeId) return;

    try {
      const savedRecipe = await saveRecipeMutation.mutateAsync({
        title: recipe.title,
        description: recipe.description,
        grillId: selectedGrill?.id,
        recipeData: recipe,
        proteins: recipe.proteins,
        servings: recipe.servings,
        totalTimeMinutes: recipe.totalTimeMinutes,
        difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard' | undefined,
      });
      setSavedRecipeId(savedRecipe.id);
    } catch (err) {
      // Error is handled by the mutation's error state
    }
  };

  const handleViewSavedRecipe = () => {
    if (savedRecipeId) {
      router.push(`/recipes/${savedRecipeId}`);
    }
  };

  const handleReset = () => {
    setSavedRecipeId(null);
    reset();
  };

  // Auto-select primary grill on mount
  useEffect(() => {
    if (grills && !selectedGrill) {
      const primary = getPrimaryGrill(grills);
      if (primary) {
        setSelectedGrill(primary);
      }
    }
  }, [grills, selectedGrill, setSelectedGrill]);

  // Trigger generation when step changes to generating and questions are done
  useEffect(() => {
    if (step === 'generating' && !isGenerating && !recipe) {
      generateRecipeFromAnswers();
    }
  }, [step, isGenerating, recipe, generateRecipeFromAnswers]);

  // Loading state
  if (grillsLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'New Cook' }} />
        <View className="flex-1 bg-char-black items-center justify-center">
          <FlameLoader size="lg" />
        </View>
      </>
    );
  }

  // No grills - prompt to add one
  if (!grills || grills.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'New Cook' }} />
        <View className="flex-1 bg-char-black items-center justify-center p-6">
          <H2 className="text-center mb-2">Add a Grill First</H2>
          <Body className="text-char-300 text-center mb-6">
            You need to add at least one grill before creating a recipe.
          </Body>
          <Button variant="primary" onPress={() => router.push('/equipment/add')}>
            Add Your First Grill
          </Button>
        </View>
      </>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <>
        <Stack.Screen options={{ title: 'New Cook' }} />
        <View className="flex-1 bg-char-black items-center justify-center p-6">
          {rateLimitError ? (
            <>
              <View className="w-16 h-16 rounded-full bg-warning/20 items-center justify-center mb-4">
                <AlertCircle size={32} color="#D4A574" />
              </View>
              <H2 className="text-center mb-2">Recipe Limit Reached</H2>
              <Body className="text-char-300 text-center mb-2">
                You've used all {rateLimitError.limit} recipes this month.
              </Body>
              <Body className="text-char-300 text-center mb-6">
                Your limit resets on {formatResetDate(rateLimitError.resetDate)}.
              </Body>
            </>
          ) : (
            <>
              <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center mb-4">
                <AlertCircle size={32} color="#8B2635" />
              </View>
              <H2 className="text-center mb-2">Something went wrong</H2>
              <Body className="text-char-300 text-center mb-6">
                {error || 'An unexpected error occurred'}
              </Body>
            </>
          )}
          <Button variant="primary" onPress={handleReset}>
            Try Again
          </Button>
        </View>
      </>
    );
  }

  // Generating state
  if (step === 'generating') {
    return (
      <>
        <Stack.Screen options={{ title: 'Generating Recipe' }} />
        <View className="flex-1 bg-char-black">
          <GeneratingView streamedContent={streamedContent} isGenerating={isGenerating} />
        </View>
      </>
    );
  }

  // Complete state - show recipe
  if (step === 'complete' && recipe) {
    const saveFooter = (
      <View className="pt-4 gap-3">
        {savedRecipeId ? (
          <>
            <Button
              variant="primary"
              onPress={handleViewSavedRecipe}
              leftIcon={Check}
            >
              View Saved Recipe
            </Button>
            <Button variant="ghost" onPress={handleReset}>
              Start New Cook
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              onPress={handleSaveRecipe}
              loading={saveRecipeMutation.isPending}
              leftIcon={BookmarkPlus}
            >
              Save Recipe
            </Button>
            {saveRecipeMutation.isError && (
              <Text className="font-body text-sm text-error text-center">
                Failed to save recipe. Please try again.
              </Text>
            )}
          </>
        )}
      </View>
    );

    return (
      <>
        <Stack.Screen
          options={{
            title: recipe.title,
            headerRight: () => (
              <Button variant="ghost" size="sm" onPress={handleReset}>
                New Cook
              </Button>
            ),
          }}
        />
        <View className="flex-1 bg-char-black">
          <RecipeView recipe={recipe} footer={saveFooter} />
        </View>
      </>
    );
  }

  // Clarification state
  if (step === 'clarifying' && questions.length > 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Quick Questions' }} />
        <View className="flex-1 bg-char-black">
          <ClarificationChat
            questions={questions}
            answers={answers}
            onAnswer={answerQuestion}
            onSubmit={generateRecipeFromAnswers}
            isLoading={isAskingQuestions}
          />
        </View>
      </>
    );
  }

  // Input state (default)
  return (
    <>
      <Stack.Screen options={{ title: 'New Cook' }} />
      <ScrollView
        className="flex-1 bg-char-black"
        contentContainerClassName="p-4"
        keyboardShouldPersistTaps="handled"
      >
        {/* Grill Selector */}
        <GrillSelector
          grills={grills}
          selectedGrill={selectedGrill}
          onSelect={setSelectedGrill}
        />

        {/* Cook Input */}
        <CookInput
          value={userInput}
          onChange={setUserInput}
          onSubmit={startClarification}
          isLoading={isAskingQuestions}
          disabled={!selectedGrill}
        />

        {/* Error display */}
        {error && (
          <Card variant="outlined" className="mt-4 border-error">
            <View className="flex-row items-center gap-2">
              <AlertCircle size={16} color="#8B2635" />
              <Text className="font-body text-sm text-error flex-1">{error}</Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </>
  );
}
