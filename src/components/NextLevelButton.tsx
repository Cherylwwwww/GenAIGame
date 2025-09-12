import React, { useState } from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';

interface NextLevelButtonProps {
  modelAccuracy: number;
  modelState: 'underfitting' | 'correct' | 'overfitting';
  hasTrainedModel: boolean;
  onNextLevel: () => void;
  currentLevel: number;
}

export const NextLevelButton: React.FC<NextLevelButtonProps> = ({
  modelAccuracy,
  modelState,
  hasTrainedModel,
  onNextLevel,
  currentLevel
}) => {
  const [showOverfitWarning, setShowOverfitWarning] = useState(false);

  const canProceed = hasTrainedModel && modelAccuracy >= 70;
  const isOverfitting = modelState === 'overfitting';

  const getButtonStyle = () => {
    if (!canProceed) {
      return {
        className: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        text: '需要训练模型'
      };
    }
    
    if (isOverfitting) {
      return {
        className: 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105',
        text: '⚠️ 继续下一关'
      };
    }
    
    return {
      className: 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105',
      text: '🎉 进入下一关'
    };
  };

  const buttonStyle = getButtonStyle();

  const handleClick = () => {
    if (!canProceed) return;
    
    if (isOverfitting && !showOverfitWarning) {
      setShowOverfitWarning(true);
      return;
    }
    
    onNextLevel();
    setShowOverfitWarning(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* 过拟合警告弹窗 */}
      {showOverfitWarning && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-2">⚠️ 过拟合警告</h4>
              <p className="text-sm text-red-700 mb-3">
                你的模型可能过度记忆了训练数据，在新数据上表现可能不佳。
                建议减少标注数量或提高标注质量。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={onNextLevel}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  仍然继续
                </button>
                <button
                  onClick={() => setShowOverfitWarning(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  重新训练
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主按钮 */}
      <div className="text-center">
        <button
          onClick={handleClick}
          disabled={!canProceed}
          className={`px-8 py-4 rounded-lg font-medium transition-all duration-200 text-lg ${buttonStyle.className}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>{buttonStyle.text}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
        
        {/* 状态提示 */}
        <div className="mt-4 text-sm">
          {!hasTrainedModel && (
            <p className="text-gray-500">
              💡 完成标注并训练模型后可进入下一关
            </p>
          )}
          
          {hasTrainedModel && modelAccuracy < 70 && (
            <p className="text-orange-600">
              📈 模型准确率需要达到70%以上 (当前: {modelAccuracy}%)
            </p>
          )}
          
          {canProceed && modelState === 'correct' && (
            <p className="text-green-600">
              ✅ 模型表现优秀！准备好挑战第 {currentLevel + 1} 关了吗？
            </p>
          )}
          
          {canProceed && modelState === 'overfitting' && !showOverfitWarning && (
            <p className="text-red-600">
              ⚠️ 模型可能过拟合，点击查看详情
            </p>
          )}
        </div>
      </div>
    </div>
  );
};