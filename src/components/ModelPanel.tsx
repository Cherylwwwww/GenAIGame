import React from 'react';
import { GameImage, BoundingBox } from '../types';

interface ModelPanelProps {
  images: GameImage[];
  modelAccuracy: number;
  isTraining: boolean;
  hasTrainedModel: boolean;
  onTrainModel: () => void;
  canTrain: boolean;
  modelState: 'underfitting' | 'correct' | 'overfitting';
  currentCategory: string;
  annotatedCount: number;
}

export const ModelPanel: React.FC<ModelPanelProps> = ({
  images,
  modelAccuracy,
  isTraining,
  hasTrainedModel,
  onTrainModel,
  canTrain,
  modelState,
  currentCategory,
  annotatedCount
}) => {
  const testImage = images[0];
  
  const getModelStateDisplay = () => {
    switch (modelState) {
      case 'underfitting':
        return { 
          text: '欠拟合', 
          color: 'text-gray-600', 
          bg: 'bg-gray-50',
          barColor: 'from-gray-400 to-gray-500',
          description: '模型需要更多训练数据'
        };
      case 'correct':
        return { 
          text: '合理拟合', 
          color: 'text-green-600', 
          bg: 'bg-green-50',
          barColor: 'from-blue-500 to-green-500',
          description: '✅ 模型学会了真正规律'
        };
      case 'overfitting':
        return { 
          text: '过拟合', 
          color: 'text-red-600', 
          bg: 'bg-red-50',
          barColor: 'from-red-500 to-orange-500',
          description: '⚠️ 模型只会背，泛化能力差'
        };
    }
  };

  const stateDisplay = getModelStateDisplay();

  // 动态计算准确率范围
  const getAccuracyRange = () => {
    switch (modelState) {
      case 'underfitting':
        return { min: 30, max: 50 };
      case 'correct':
        return { min: 85, max: 90 };
      case 'overfitting':
        return { min: 60, max: 70 };
    }
  };

  const accuracyRange = getAccuracyRange();
  const displayAccuracy = hasTrainedModel ? modelAccuracy : Math.min(30 + annotatedCount * 3, 50);

  return (
    <div className="bg-white rounded-lg border-2 border-blue-500 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 AI模型训练区</h3>
        
        {!hasTrainedModel && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>提示:</strong> 标注几张图片就可以开始训练！
              标注质量越好，模型效果越佳。
            </p>
          </div>
        )}
      </div>
      
      {/* 训练按钮 */}
      <div className="text-center mb-6">
        <button
          onClick={onTrainModel}
          disabled={isTraining || !canTrain}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 text-lg ${
            isTraining || !canTrain
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isTraining ? '🔄 模型训练中...' : '🚀 开始训练模型'}
        </button>
        
        {!canTrain && (
          <p className="mt-2 text-sm text-gray-500">
            请至少标注1张图片开始训练
          </p>
        )}
        
        {isTraining && (
          <div className="mt-3">
            <div className="animate-pulse text-sm text-gray-600">
              正在分析你的标注数据并构建AI模型...
            </div>
          </div>
        )}
      </div>
      
      {/* 测试图片区域 */}
      {testImage && (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <h4 className="text-md font-semibold text-gray-700">📸 测试图片</h4>
          </div>
          
          <div className="relative">
            <img
              src={testImage.url}
              alt="测试图片"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
            />
            
            {/* 模型预测框 */}
            {hasTrainedModel && testImage.modelPrediction === true && (
              <div
                className="absolute border-3 border-green-500 bg-green-500 bg-opacity-20 animate-pulse"
                style={{
                  left: '25%',
                  top: '20%', 
                  width: '50%',
                  height: '60%'
                }}
              />
            )}
            
            {/* 预测结果标签 */}
            {hasTrainedModel && testImage.modelPrediction !== undefined && (
              <div className="absolute top-2 right-2">
                <div className={`px-3 py-1 rounded-lg text-sm font-medium animate-fadeIn ${
                  testImage.modelPrediction ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {testImage.modelPrediction ? `✓ 发现${currentCategory}` : `✗ 未发现${currentCategory}`}
                  {testImage.confidence && (
                    <div className="text-xs opacity-90">
                      置信度: {Math.round(testImage.confidence * 100)}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 动态准确率进度条 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-semibold text-gray-800 mb-3 text-center">📊 模型性能分析</h4>
        
        {/* 实时准确率显示 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">当前准确率:</span>
            <span className={`font-bold text-lg ${stateDisplay.color}`}>
              {displayAccuracy}%
            </span>
          </div>
          
          {/* 动态进度条 */}
          <div className="relative">
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r ${stateDisplay.barColor} h-3 rounded-full transition-all duration-1000 ease-out ${
                  modelState === 'overfitting' ? 'animate-pulse' : ''
                }`}
                style={{ width: `${Math.min(displayAccuracy, 100)}%` }}
              />
            </div>
            
            {/* 准确率区间标记 */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="text-yellow-600">50%</span>
              <span className="text-green-600">85%</span>
              <span>100%</span>
            </div>
          </div>
          
          {/* 模型状态指示器 */}
          <div className={`text-center py-3 px-4 rounded-lg border ${stateDisplay.bg} ${
            stateDisplay.color === 'text-green-600' ? 'border-green-200' : 
            stateDisplay.color === 'text-red-600' ? 'border-red-200' : 'border-gray-200'
          }`}>
            <div className={`font-semibold ${stateDisplay.color} mb-1`}>
              模型状态: {stateDisplay.text}
            </div>
            <div className="text-sm text-gray-700">
              {stateDisplay.description}
            </div>
          </div>
          
          {/* 训练建议 */}
          {!hasTrainedModel && annotatedCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <strong>训练建议:</strong>
                {annotatedCount < 3 && " 继续标注更多图片可以提高准确率"}
                {annotatedCount >= 3 && annotatedCount < 7 && " 当前数据量适中，可以开始训练"}
                {annotatedCount >= 7 && " 数据充足，小心过拟合"}
              </div>
            </div>
          )}
          
          {/* 实时反馈 */}
          {annotatedCount > 0 && !hasTrainedModel && (
            <div className="text-center">
              <div className="text-sm text-gray-600">
                已标注: {annotatedCount} 张图片
              </div>
              <div className="text-xs text-gray-500 mt-1">
                预估准确率: {Math.min(30 + annotatedCount * 5, 85)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};