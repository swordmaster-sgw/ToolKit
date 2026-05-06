/**
 * 反馈模块 - 弹窗交互逻辑
 */

const FEEDBACK_API_BASE = window.API_BASE || 'http://localhost:8787';

function toggleFeedbackModal() {
  const overlay = document.getElementById('feedback-overlay');
  const isVisible = overlay.classList.contains('active');

  if (isVisible) {
    closeFeedbackModal();
  } else {
    openFeedbackModal();
  }
}

function openFeedbackModal() {
  const overlay = document.getElementById('feedback-overlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // 填充工具下拉
  const select = document.getElementById('fb-tool');
  if (select.options.length <= 1 && window.allTools) {
    const seen = new Set();
    window.allTools.forEach(tool => {
      if (!seen.has(tool.id)) {
        const opt = document.createElement('option');
        opt.value = tool.id;
        opt.textContent = `${tool.icon} ${tool.name}`;
        opt.dataset.name = tool.name;
        select.appendChild(opt);
        seen.add(tool.id);
      }
    });
  }
}

function closeFeedbackModal(e) {
  if (e && e.target !== e.currentTarget) return;
  const overlay = document.getElementById('feedback-overlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';

  // 重置表单
  const form = document.getElementById('feedback-form');
  const success = document.getElementById('feedback-success');
  form.style.display = '';
  success.style.display = 'none';
  form.reset();
  document.getElementById('fb-char-count').textContent = '0';

  // 恢复按钮
  const btn = document.getElementById('fb-submit-btn');
  btn.disabled = false;
  btn.textContent = '提交反馈';
}

async function submitFeedback(e) {
  e.preventDefault();

  const btn = document.getElementById('fb-submit-btn');
  const content = document.getElementById('fb-content').value.trim();

  if (!content) return;

  // 禁用按钮
  btn.disabled = true;
  btn.textContent = '提交中...';

  const type = document.querySelector('input[name="fb_type"]:checked').value;
  const toolSelect = document.getElementById('fb-tool');
  const toolId = toolSelect.value;
  const toolName = toolSelect.selectedOptions[0]?.dataset?.name || '';
  const contact = document.getElementById('fb-contact').value.trim();

  try {
    const resp = await fetch(`${FEEDBACK_API_BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, toolId, toolName, content, contact }),
    });

    const data = await resp.json();

    if (data.ok) {
      // 显示成功状态
      document.getElementById('feedback-form').style.display = 'none';
      const successEl = document.getElementById('feedback-success');
      successEl.style.display = '';

      const hint = document.getElementById('feedback-issue-hint');
      if (data.issueUrl) {
        hint.innerHTML = `已同步到 <a href="${data.issueUrl}" target="_blank">GitHub Issue</a>`;
      } else {
        hint.textContent = '已记录，我们会尽快处理。';
      }
    } else {
      alert(data.error || '提交失败，请稍后重试');
      btn.disabled = false;
      btn.textContent = '提交反馈';
    }
  } catch (err) {
    alert('网络错误，请稍后重试。');
    btn.disabled = false;
    btn.textContent = '提交反馈';
  }
}

// 字数统计
document.getElementById('fb-content')?.addEventListener('input', function () {
  document.getElementById('fb-char-count').textContent = this.value.length;
});
