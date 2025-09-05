// 核心功能模块
let images = []; // 存储上传的图片
let currentMode = 'layout'; // 'layout' 或 'puzzle'
let currentLayout = null;
let currentOrientation = 'horizontal';
let draggedItem = null;
let isAltPressed = false;
let startX, startY, offsetX, offsetY;

// DOM 元素缓存
const elements = {};

// 检查元素是否存在的辅助函数
function checkElements() {
    elements.dropZone = document.getElementById('dropZone');
    elements.fileInput = document.getElementById('fileInput');
    elements.previewArea = document.getElementById('previewArea');
    elements.downloadBtn = document.getElementById('downloadBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    elements.gapInput = document.getElementById('gap');
    elements.borderRadiusInput = document.getElementById('borderRadius');
    elements.borderColorInput = document.getElementById('borderColor');
    elements.borderWidthInput = document.getElementById('borderWidth');
    elements.layoutModeBtn = document.getElementById('layoutMode');
    elements.puzzleModeBtn = document.getElementById('puzzleMode');
    elements.layoutTemplates = document.getElementById('layoutTemplates');
    elements.puzzleOrientation = document.getElementById('puzzleOrientation');
    elements.horizontalBtn = document.getElementById('horizontal');
    elements.verticalBtn = document.getElementById('vertical');
    elements.templateItems = document.querySelectorAll('.template');
    
    // 检查关键元素是否存在
    return Object.values(elements).every(element => element !== null);
}

// 初始化函数
function initCore() {
    // 检查元素是否都存在
    if (!checkElements()) {
        console.error('无法初始化核心功能：缺少必要的DOM元素');
        return;
    }

    // 绑定事件 - 原有代码
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);

    // 新增：为预览区域添加点击和拖放事件
    elements.previewArea.addEventListener('click', function(e) {
        // 只有当预览区域没有图片时才触发上传
        if (images.length === 0 && !e.target.closest('.resize-handle') && !e.target.closest('.remove-btn')) {
            elements.fileInput.click();
        }
    });
    elements.previewArea.addEventListener('dragover', handleDragOver);
    elements.previewArea.addEventListener('dragleave', handleDragLeave);
    elements.previewArea.addEventListener('drop', handleDrop);
    elements.downloadBtn.addEventListener('click', downloadImage);
    elements.resetBtn.addEventListener('click', resetApp);
    elements.gapInput.addEventListener('input', updatePreview);
    elements.borderRadiusInput.addEventListener('input', updatePreview);
    elements.borderColorInput.addEventListener('input', updatePreview);
    elements.borderWidthInput.addEventListener('input', updatePreview);
    elements.layoutModeBtn.addEventListener('click', () => switchMode('layout'));
    elements.puzzleModeBtn.addEventListener('click', () => switchMode('puzzle'));
    elements.horizontalBtn.addEventListener('click', () => setOrientation('horizontal'));
    elements.verticalBtn.addEventListener('click', () => setOrientation('vertical'));
    elements.templateItems.forEach(template => template.addEventListener('click', selectTemplate));

    // 监听键盘事件
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // 高级设置切换
    const toggleAdvancedSettings = document.getElementById('toggleAdvancedSettings');
    const advancedSettings = document.getElementById('advancedSettings');

    if (toggleAdvancedSettings && advancedSettings) {
        toggleAdvancedSettings.addEventListener('click', () => {
            if (advancedSettings.style.display === 'none') {
                advancedSettings.style.display = 'block';
                toggleAdvancedSettings.innerHTML = '<i class="fas fa-cog"></i> 收起高级设置';
            } else {
                advancedSettings.style.display = 'none';
                toggleAdvancedSettings.innerHTML = '<i class="fas fa-cog"></i> 高级设置';
            }
        });
    }

    // 导出质量显示
    const exportQuality = document.getElementById('exportQuality');
    const qualityValue = document.getElementById('qualityValue');

    if (exportQuality && qualityValue) {
        exportQuality.addEventListener('input', function() {
            const quality = parseFloat(this.value);
            qualityValue.textContent = Math.round(quality * 100) + '%';
        });
    }

    // 初始化预览区域
    updatePreview();
}

// 重置应用
function resetApp() {
    images = [];
    currentLayout = null;
    if (elements.templateItems) {
        elements.templateItems.forEach(t => t.classList.remove('active'));
    }
    if (elements.fileInput) {
        elements.fileInput.value = '';
    }
    updatePreview();
}

// 键盘事件处理
function handleKeyDown(e) {
    if (e.key === 'Alt') {
        isAltPressed = true;
    }
}

function handleKeyUp(e) {
    if (e.key === 'Alt') {
        isAltPressed = false;
    }
}

// 删除此占位函数
function downloadImage() {
    alert('下载功能将在script-download.js中实现');
}

// 延迟初始化，确保DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否存在initSaveDialog函数，如果不存在则创建一个占位函数
    if (typeof initSaveDialog !== 'function') {
        window.initSaveDialog = function() {
            console.warn('initSaveDialog函数未实现');
        };
    }
    
    initCore();
    initSaveDialog();
});

// 确保handleFileSelect在全局作用域可用
window.handleFileSelect = handleFileSelect;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;