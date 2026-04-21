# 🔯 Otzar Kodesh

**Sacred Treasury of Kabbalistic Computation**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)

A professionally architected web application for exploring Hebrew gematria, miluy systems, and Kabbalistic letter analysis with academic rigor.

---

## ✨ Features

### 🔤 Hebrew Keyboard
- **RTL Layout**: Right-to-left Hebrew keyboard (א ב ג...)
- **Color-Coded Keys**: Letters display in mystical colors
- **Gematria Values**: Each key shows its numerical value
- **Final Letters**: Toggle for sofit letters (ךםןףץ)
- **Smart Actions**: Backspace, Space, Clear

### 🔢 Gematria Systems
- **Standard (Mispar Hechrechi)**: ך=20, ם=40, ן=50, ף=80, ץ=90
- **Large (Mispar Gadol)**: ך=500, ם=600, ן=700, ף=800, ץ=900
- **Digital Sum**: Kabbalistic reduction (Mispar Katan)

### 🌟 Miluy Systems (Lurianic Kabbalah)
Four worlds of letter expansion:
- **AB (72)** - Atzilut: יוד-הי-ויו-הי
- **SaG (63)** - Beriah: יוד-הי-ואו-הי
- **MaH (45)** - Yetzirah: יוד-הא-ואו-הא
- **BaN (52)** - Assiah: יוד-הה-וו-הה

### 🎨 Color Systems
- **Zohar**: Traditional eye symbolism (י=white, ה=red, ו=green)
- **Golden Dawn**: Western Hermetic tradition
- **Sefirot**: Cordovero's mapping (Pardes Rimonim)
- **Akashic**: Experiential colors

### 🖥️ UI Features
- **Real-time Coloring**: Letters change color as you type
- **RTL Input**: Proper right-to-left Hebrew text
- **Responsive Design**: Works on desktop, tablet, mobile
- **No Hebrew Keyboard Needed**: On-screen keyboard included

---

## 🚀 Quick Start
```bash
# Clone the repository
git clone https://github.com/nullzero000/otzar-kodesh.git
cd otzar-kodesh

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test Examples

### Basic Gematria
```
Input: יהוה
Standard: 26 (י=10, ה=5, ו=6, ה=5)
Reduced: 8 (2+6)
```

### Miluy Expansion
```
Input: יהוה
AB System: יוד הי ויו הי = 72
SaG System: יוד הי ואו הי = 63
MaH System: יוד הא ואו הא = 45
BaN System: יוד הה וו הה = 52
```

### Final Letters
```
Input: שלום
Standard: 376 (ש=300, ל=30, ו=6, ם=40)
Large: 936 (ש=300, ל=30, ו=6, ם=600)
```

---

## 🏗️ Architecture

### Clean Architecture (3 Layers)
```
src/
├── features/              # Feature modules (UI + Logic)
│   └── hebrew-keyboard/   # Modular keyboard component
├── domain/                # Pure business logic
│   ├── types/            # Type definitions
│   ├── constants/        # Data (alphabet, colors)
│   └── engines/          # Calculation engines
└── infrastructure/        # State & external deps
    └── stores/           # Zustand state management
```

### Key Principles
- ✅ **Separation of Concerns**: Logic separate from UI
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Modularity**: Features are self-contained
- ✅ **Testability**: Pure functions, easy to test
- ✅ **Scalability**: Add features without breaking existing code

---

## 📚 Academic Foundations

### Primary Sources
- **Sefer Yetzirah** (2nd-6th century) - Letter values and meanings
- **Etz Chaim** (Chaim Vital, 16th century) - Lurianic Kabbalah
- **Tikkunei Zohar** (13th century) - Color symbolism
- **Pardes Rimonim** (Cordovero, 16th century) - Sefirot mapping

### Scholarly Research
- **Gershom Scholem**: *Major Trends in Jewish Mysticism* (1941)
- **Moshe Idel**: *Kabbalah: New Perspectives* (Yale, 1988)
- **Aryeh Kaplan**: *Sefer Yetzirah: The Book of Creation* (1990)

### Digital Resources
- [Sefaria.org](https://www.sefaria.org) - Primary text database
- [HebrewBooks.org](https://www.hebrewbooks.org) - Historical manuscripts

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.4
- **State**: Zustand 4.5
- **Styling**: CSS-in-JS (React inline styles)
- **Architecture**: Clean Architecture pattern

---

## 🎯 Validation

All calculations validated against academic sources:

| Test | Expected | Result | Status |
|------|----------|--------|--------|
| יהוה (Standard) | 26 | 26 | ✅ |
| שלום (Standard) | 376 | 376 | ✅ |
| שלום (Large) | 936 | 936 | ✅ |
| יהוה AB Miluy | 72 | 72 | ✅ |
| יהוה SaG Miluy | 63 | 63 | ✅ |
| יהוה MaH Miluy | 45 | 45 | ✅ |
| יהוה BaN Miluy | 52 | 52 | ✅ |

---

## 🌟 Perfect For

- 📖 **Students** learning Hebrew alphabet
- 🔬 **Researchers** exploring Kabbalah computationally
- 🧘 **Practitioners** of meditation techniques
- 💻 **Developers** interested in Clean Architecture
- 🌍 **Anyone** curious about mystical traditions

---

## 🚧 Roadmap

### v2.0 - Advanced Analysis
- [ ] Multi-level Miluy expansion
- [ ] Atbash & Albam transformations
- [ ] Word equivalencies finder
- [ ] Letter frequency analysis

### v3.0 - Meditation Tools
- [ ] Fullscreen visualization mode
- [ ] Breathing cycle integration
- [ ] Letter permutation sequences
- [ ] Sound/frequency mapping

### v4.0 - Export & Share
- [ ] PDF report generation
- [ ] Share results via URL
- [ ] Save custom configurations
- [ ] Historical comparison

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

Built with deep respect for the sacred traditions of Kabbalah and the scholars who preserved this wisdom through the centuries.

---

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [Wiki](https://github.com/nullzero000/otzar-kodesh/wiki)
- **Issues**: [Report Bug](https://github.com/nullzero000/otzar-kodesh/issues)

---

**Built with 💛 and academic rigor**

*"The gates of wisdom are never closed"* - Sefer Yetzirah
