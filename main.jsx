import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import tracks from "virtual:tracks";
import "./style.css";

const covers = import.meta.glob("./album-art/*.jpeg", {
  eager: true,
  import: "default",
});

function App() {
  const playing = useRef(null);
  function onPlay(event) {
    if (playing.current !== event.currentTarget) playing.current?.pause();
    playing.current = event.currentTarget;
  }
  return (
    <main>
      <header>
        <h1>오디오 보관함</h1>
        <span>{tracks.length}곡</span>
      </header>
      {tracks.length === 0 && <p>public 폴더에 오디오 파일을 추가해 주세요.</p>}
      <ul>
        {tracks.map((path) => {
          const filename = path.split("/").pop();
          const name = filename.replace(/\.[^.]+$/, "");
          const url =
            import.meta.env.BASE_URL +
            path.split("/").map(encodeURIComponent).join("/");
          const cover = covers["./album-art/" + name + ".jpeg"];
          const split = name.indexOf(" - ");
          const title = split < 0 ? name : name.slice(split + 3);
          return (
            <li key={path}>
              {cover ? (
                <img src={cover} alt="" loading="lazy" />
              ) : (
                <div className="cover" aria-hidden="true">
                  ♫
                </div>
              )}
              <div className="label">
                <strong>{title}</strong>
                {split >= 0 && <small>{name.slice(0, split)}</small>}
              </div>
              <audio
                controls
                preload="none"
                src={url}
                onPlay={onPlay}
                aria-label={name + " 재생"}
              />
              <a href={url} download={filename} aria-label={name + " 다운로드"}>
                다운로드 ↓
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);
