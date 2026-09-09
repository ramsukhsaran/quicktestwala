import { getAllQuestions, getQuestionBankStats } from "@/lib/data/store";
import { QuestionBankManager } from "@/components/admin/question-bank-manager";

export default async function AdminQuestionsPage() {
  const [questions, stats] = await Promise.all([
    getAllQuestions(),
    getQuestionBankStats(),
  ]);

  return <QuestionBankManager initialQuestions={questions as any} stats={stats} />;
}
