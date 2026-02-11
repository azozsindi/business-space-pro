
import { GoogleGenAI } from "@google/genai";
import { DayData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailySummary = async (dayData: DayData) => {
  const prompt = `
    أنت مستشار أعمال خبير ومساعد ذكي متطور. قم بتحليل بيانات يوم العمل هذه بدقة:
    
    الملاحظات المكتوبة: ${dayData.notes || "لا يوجد ملاحظات"}
    
    المهام المسجلة:
    ${dayData.tasks.map(t => `- [${t.completed ? 'مكتملة' : 'قيد التنفيذ'}] ${t.text} ${t.completedBy ? `(أنجزها: ${t.completedBy})` : ''}`).join('\n')}
    
    الوسائط المرفقة: ${dayData.media.length} (تشمل صور ومقاطع صوتية وفيديو).

    المطلوب منك:
    1. تلخيص سريع لأبرز ما حدث في هذا اليوم.
    2. تقييم أداء الفريق بناءً على المهام المنجزة ومن قام بها.
    3. تقديم 3 توصيات ذكية وعملية لليوم التالي لزيادة الكفاءة.
    4. إذا كان هناك مهام لم تكتمل، اقترح طريقة لتسريعها.

    اجعل الرد ملهماً، مهنياً، ومختصراً بأسلوب "Business Space" الراقي.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 5000 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، نظام الذكاء الاصطناعي يواجه ضغطاً حالياً. يرجى المحاولة لاحقاً.";
  }
};
