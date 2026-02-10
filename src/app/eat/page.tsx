"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

// 美食分类和选项
const foodCategories = {
  中餐: [
    "黄焖鸡",
    "麻辣烫",
    "兰州拉面",
    "酸菜鱼",
    "红烧肉",
    "宫保鸡丁",
    "回锅肉",
    "水煮鱼",
    "东坡肉",
    "糖醋里脊",
  ],
  西餐: [
    "意大利面",
    "牛排",
    "披萨",
    "汉堡",
    "三明治",
    "沙拉",
    "焗饭",
    "千层面",
    "奶油蘑菇汤",
    "烤鸡",
  ],
  日料: [
    "寿司",
    "拉面",
    "天妇罗",
    "刺身",
    "鳗鱼饭",
    "章鱼小丸子",
    "猪排饭",
    "牛丼",
    "乌冬面",
    "亲子丼",
  ],
  韩餐: [
    "石锅拌饭",
    "炸鸡",
    "部队锅",
    "冷面",
    "韩式烤肉",
    "泡菜汤",
    "参鸡汤",
    "海鲜饼",
    "炒年糕",
    "芝士排骨",
  ],
  东南亚: [
    "泰式冬阴功",
    "越南米粉",
    "椰浆咖喱",
    "菠萝炒饭",
    "肉骨茶",
    "海南鸡饭",
    "新加坡炒面",
    "春卷",
    "印尼炒饭",
    "泰式炒河粉",
  ],
  快餐: [
    "麦当劳",
    "肯德基",
    "汉堡王",
    "赛百味",
    "德克士",
    "必胜客",
    "吉野家",
    "真功夫",
    "老娘舅",
    "永和大王",
  ],
  小吃: [
    "煎饼果子",
    "凉皮",
    "肉夹馍",
    "包子",
    "饺子",
    "混沌",
    "炒面",
    "炒河粉",
    "米线",
    "酸辣粉",
  ],
  火锅: [
    "重庆火锅",
    "海底捞",
    "呷哺呷哺",
    "鱼火锅",
    "羊蝎子",
    "串串香",
    "冒菜",
    "老北京涮羊肉",
    "潮汕牛肉火锅",
    "云南菌汤锅",
  ],
  烧烤: [
    "羊肉串",
    "烤鱼",
    "烤肉",
    "烤茄子",
    "烤韭菜",
    "烤鸡翅",
    "烤五花肉",
    "烤生蚝",
    "烤鱿鱼",
    "烤玉米",
  ],
  甜品: [
    "奶茶",
    "冰淇淋",
    "蛋糕",
    "甜甜圈",
    "芋圆",
    "双皮奶",
    "杨枝甘露",
    "糖水",
    "烧仙草",
    "冰粉",
  ],
};

// 美食语录
const foodQuotes = [
  "没有什么是一顿美食解决不了的，如果有，那就两顿！",
  "唯有美食与爱不可辜负。",
  "人生得意须尽欢，胡吃海喝需尽兴。",
  "吃饭是为了活着，但活着不仅仅是为了吃饭。",
  "美食是最好的心情调节剂。",
  "今天也要好好吃饭呀！",
  "世界上没有什么烦恼是一顿美食解决不了的。",
  "吃货的人生就像一列火车，总结起来就是：逛吃逛吃逛吃。",
  "好好生活，慢慢吃饭。",
  "热爱生活，从好好吃饭开始。",
  "美食是天性，静静咀嚼，轻轻回味。",
  "吃得健康，活得快乐。",
  "人间烟火气，最抚凡人心。",
  "今天想吃什么？就吃什么吧！",
  "美食当前，总能有所思，或馋性千娇。",
];

export default function EatPage() {
  const [excludedCategories, setExcludedCategories] = useState<Set<string>>(
    new Set()
  );
  const [result, setResult] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [quote, setQuote] = useState<string>("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningText, setSpinningText] = useState("");

  // 获取可选分类
  const getAvailableCategories = useCallback(() => {
    return Object.keys(foodCategories).filter(
      (cat) => !excludedCategories.has(cat)
    );
  }, [excludedCategories]);

  // 切换分类排除状态
  const toggleCategory = (cat: string) => {
    const newExcluded = new Set(excludedCategories);
    if (newExcluded.has(cat)) {
      newExcluded.delete(cat);
    } else {
      newExcluded.add(cat);
    }
    setExcludedCategories(newExcluded);
  };

  // 老虎机滚动效果
  const spinSlotMachine = useCallback(() => {
    const availableCategories = getAvailableCategories();

    if (availableCategories.length === 0) {
      alert("请至少选择一个分类！");
      return;
    }

    setIsSpinning(true);
    setResult("");
    setCategory("");

    // 所有选项的数组
    const allOptions: string[] = [];
    availableCategories.forEach((cat) => {
      foodCategories[cat as keyof typeof foodCategories].forEach((food) => {
        allOptions.push(food);
      });
    });

    let counter = 0;
    const maxSpins = 20;
    const interval = setInterval(() => {
      const randomFood =
        allOptions[Math.floor(Math.random() * allOptions.length)];
      setSpinningText(randomFood);
      counter++;

      if (counter >= maxSpins) {
        clearInterval(interval);

        // 最终随机选择
        const finalCategory =
          availableCategories[
            Math.floor(Math.random() * availableCategories.length)
          ];
        const foods =
          foodCategories[finalCategory as keyof typeof foodCategories];
        const finalFood = foods[Math.floor(Math.random() * foods.length)];
        const finalQuote = foodQuotes[Math.floor(Math.random() * foodQuotes.length)];

        setTimeout(() => {
          setResult(finalFood);
          setCategory(finalCategory);
          setQuote(finalQuote);
          setIsSpinning(false);
          setSpinningText("");
        }, 300);
      }
    }, 100);
  }, [excludedCategories, getAvailableCategories]);

  return (
    <ToolLayout
      title="今天吃什么？ 🍜"
      description="随机美食决策器 - 选择困难症的救星"
    >
      {/* 分类选择 */}
      <div>
        <label className="block text-sm text-dark-300 mb-3">
          选择分类（点击排除不想吃的）
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(foodCategories).map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                excludedCategories.has(cat)
                  ? "bg-dark-800 text-dark-500 line-through opacity-50"
                  : "bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 转盘按钮 */}
      <div className="text-center">
        <button
          onClick={spinSlotMachine}
          disabled={isSpinning}
          className="tool-btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? "🎰 正在抽取..." : "🎲 开始抽取"}
        </button>
      </div>

      {/* 老虎机显示区域 */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
        {isSpinning && (
          <div className="text-center">
            <div className="text-6xl font-bold text-accent animate-pulse mb-4">
              {spinningText}
            </div>
            <div className="text-dark-400 text-sm">🎰 滚动中...</div>
          </div>
        )}

        {!isSpinning && result && (
          <div className="text-center animate-fade-in">
            <div className="text-7xl font-bold text-accent mb-4 animate-bounce-in">
              {result}
            </div>
            <div className="text-xl text-dark-300 mb-6">[ {category} ]</div>
            <div className="text-dark-400 italic text-sm border-t border-dark-700 pt-4 max-w-md mx-auto">
              💭 {quote}
            </div>
          </div>
        )}

        {!isSpinning && !result && (
          <div className="text-center text-dark-500">
            <div className="text-4xl mb-2">🍽️</div>
            <div className="text-sm">点击上方按钮开始抽取</div>
          </div>
        )}
      </div>

      {/* 再来一个按钮 */}
      {result && !isSpinning && (
        <div className="text-center">
          <button
            onClick={spinSlotMachine}
            className="tool-btn-secondary px-6 py-2"
          >
            🔄 再来一个
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </ToolLayout>
  );
}
