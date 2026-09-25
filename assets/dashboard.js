let session = null;

const CATEGORY_LABELS = {
  recent_works: "Recent Work",
  social_media_reels: "Social Media Reel",
  ae_works: "AE Work",
  pr_works: "PR Work",
};

async function guard() {
  const { data } = await sb.auth.getSession();
  session = data.session;
  if (!session) {
    window.location.href = "login.html";
    return;
  }
  document.getElementById("admin-email").textContent = session.user.email;
  loadItems();
}

async function logout() {
  await sb.auth.signOut();
  window.location.href = "login.html";
}

async function loadItems() {
  const list = document.getElementById("admin-list");
  const { data, error } = await sb.from("media").select("*").order("created_at", { ascending: false });
  if (error) {
    list.innerHTML = `<div class="empty-state">Could not load items.</div>`;
    return;
  }
  if (!data.length) {
    list.innerHTML = `<div class="empty-state">No uploads yet. Add your first image or video.</div>`;
    return;
  }
  list.innerHTML = data.map((item) => `
    <div class="admin-row" data-id="${item.id}">
      ${item.type === "video"
        ? `<video class="thumb" src="${item.url}" muted></video>`
        : `<img class="thumb" src="${item.url}" />`
      }
      <div class="info">
        <h4>${escapeHtml(item.title || "Untitled")}</h4>
        <span>${CATEGORY_LABELS[item.category] || item.type} · ${new Date(item.created_at).toLocaleDateString()}</span>
      </div>
      <div class="actions">
        <button class="icon-btn" onclick="editItem('${item.id}')">Edit</button>
        <button class="icon-btn danger" onclick="deleteItem('${item.id}', '${item.type}', '${encodeURIComponent(item.url)}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---- Upload ----
document.addEventListener("DOMContentLoaded", () => {
  guard();

  const form = document.getElementById("upload-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("file-input");
    const category = document.getElementById("category-input").value;
    const title = document.getElementById("title-input").value.trim();
    const description = document.getElementById("desc-input").value.trim();
    const file = fileInput.files[0];
    const msg = document.getElementById("upload-msg");
    const bar = document.getElementById("progress-bar");
    const fill = document.getElementById("progress-fill");
    const submitBtn = document.getElementById("upload-submit");

    if (!file) {
      msg.textContent = "Choose a file first.";
      msg.className = "form-msg error";
      return;
    }
    if (!category) {
      msg.textContent = "Choose a category first.";
      msg.className = "form-msg error";
      return;
    }

    const type = file.type.startsWith("video") ? "video" : "image";
    const bucket = type === "video" ? "videos" : "images";
    const path = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    submitBtn.disabled = true;
    bar.classList.add("active");
    fill.style.width = "10%";
    msg.textContent = "";

    const { error: uploadError } = await sb.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      msg.textContent = "Upload failed: " + uploadError.message;
      msg.className = "form-msg error";
      submitBtn.disabled = false;
      bar.classList.remove("active");
      return;
    }

    fill.style.width = "70%";

    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { error: insertError } = await sb.from("media").insert({
      type,
      category,
      title,
      description,
      url: publicUrl,
    });

    fill.style.width = "100%";

    if (insertError) {
      msg.textContent = "Saved file but failed to record it: " + insertError.message;
      msg.className = "form-msg error";
    } else {
      msg.textContent = "Uploaded successfully.";
      msg.className = "form-msg ok";
      form.reset();
      loadItems();
    }

    submitBtn.disabled = false;
    setTimeout(() => { bar.classList.remove("active"); fill.style.width = "0%"; }, 600);
  });
});

// ---- Edit ----
async function editItem(id) {
  const { data } = await sb.from("media").select("*").eq("id", id).single();
  if (!data) return;
  const newTitle = prompt("Title:", data.title || "");
  if (newTitle === null) return;
  const newDesc = prompt("Description:", data.description || "");
  if (newDesc === null) return;

  const { error } = await sb.from("media").update({ title: newTitle, description: newDesc }).eq("id", id);
  if (error) {
    alert("Could not update: " + error.message);
  } else {
    loadItems();
  }
}

// ---- Delete ----
async function deleteItem(id, type, encodedUrl) {
  if (!confirm("Delete this item permanently?")) return;

  const url = decodeURIComponent(encodedUrl);
  const bucket = type === "video" ? "videos" : "images";
  const path = url.split(`/${bucket}/`)[1];

  if (path) {
    await sb.storage.from(bucket).remove([path]);
  }

  const { error } = await sb.from("media").delete().eq("id", id);
  if (error) {
    alert("Could not delete: " + error.message);
  } else {
    loadItems();
  }
}
