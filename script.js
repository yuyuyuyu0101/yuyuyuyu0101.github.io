
// 作品資料
const projects = [
    {
        title: "人工智慧應用課程專案",
        description: "運用 Teachable Machine 開發影像辨識模型，實現即時物件識別功能。",
        image: "attached_assets/人工智慧應用課堂作業.pptx"
    },
    {
        title: "經濟學期末報告",
        description: "探討通貨膨脹對台灣經濟的影響，分析經濟指標並提出政策建議。",
        image: "attached_assets/111-2_經濟學-報告.pdf"
    },
    {
        title: "網頁程式設計作品",
        description: "使用HTML、CSS和JavaScript開發響應式個人作品集網站。",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&auto=format&fit=crop&q=60"
    },
    {
        title: "金融科技創新提案",
        description: "結合金融與區塊鏈技術，提出創新支付解決方案。",
        image: "https://images.unsplash.com/photo-1613243555988-441166d4d6fd?w=500&auto=format&fit=crop&q=60"
    }
];

// 顯示作品
function displayProjects() {
    const projectGrid = document.querySelector('.project-grid');
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'col-md-6 col-lg-4';
        projectElement.innerHTML = `
            <div class="project">
                <img src="${project.image}" alt="${project.title}" class="img-fluid">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            </div>
        `;
        projectGrid.appendChild(projectElement);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displayProjects();
    initTeachableMachine();
});

// Teachable Machine
async function initTeachableMachine() {
    const URL = "./my_model/";
    let model, webcam, labelContainer, maxPredictions;

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    const webcamButton = document.getElementById('webcam-button');
    webcamButton.addEventListener('click', async () => {
        try {
            webcamButton.disabled = true;
            webcamButton.textContent = '載入中...';
            
            // 先請求相機權限
            try {
                await navigator.mediaDevices.getUserMedia({ video: true });
            } catch (err) {
                throw new Error('請允許使用相機權限並重新整理頁面');
            }
            
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();

            const flip = true;
            webcam = new tmImage.Webcam(200, 200, flip);
            await webcam.setup();
            await webcam.play();
            
            document.getElementById("webcam-container").appendChild(webcam.canvas);
            
            labelContainer = document.getElementById("label-container");
            labelContainer.innerHTML = '';
            for (let i = 0; i < maxPredictions; i++) {
                const div = document.createElement("div");
                div.className = "prediction-label";
                labelContainer.appendChild(div);
            }

            window.requestAnimationFrame(loop);
            webcamButton.textContent = '辨識中...';
        } catch (error) {
            console.error('Error:', error);
            webcamButton.disabled = false;
            webcamButton.textContent = '重試';
            alert('啟動相機時發生錯誤，請確保允許使用相機權限。');
        }
    });

    async function loop() {
        webcam.update();
        await predict();
        window.requestAnimationFrame(loop);
    }

    async function predict() {
        const prediction = await model.predict(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(1) + "%";
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }
}
