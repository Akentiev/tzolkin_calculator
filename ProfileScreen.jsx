const { useState, useEffect } = React;

const ProfileScreen = ({ userProfile, setUserProfile, seals, tones, accentColor }) => {
    const [isEditing, setIsEditing] = useState(!userProfile.birthDate);
    const [name, setName] = useState(userProfile.name || '');
    const [birthDate, setBirthDate] = useState(userProfile.birthDate || '');
    const [aiPortrait, setAiPortrait] = useState(userProfile.aiPortrait || '');
    const [loadingPortrait, setLoadingPortrait] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const hexToRgba = (hex, a) => {
        const h = String(hex || '').replace('#', '');
        if (h.length !== 6) return `rgba(255,255,255,${a})`;
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${a})`;
    };

    // Функция расчета Сюцай
    const calculateSyucai = (dateString) => {
        const d = new Date(dateString + 'T00:00:00');
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        const sumDigits = (n) => {
            return n.toString().split('').reduce((a, b) => a + parseInt(b), 0);
        };

        // Число Сознания (день рождения до однозначного)
        let consciousness = sumDigits(day);
        while (consciousness > 9) consciousness = sumDigits(consciousness);

        // Миссия (сумма всей даты)
        const fullDateStr = `${day}${month}${year}`;
        let mission = sumDigits(fullDateStr);
        while (mission > 9) mission = sumDigits(mission);

        return { consciousness, mission };
    };

    // Расчет Tzolkin при наличии даты рождения
    const getTzolkinBirth = () => {
        if (!birthDate) return null;
        return typeof calculateKin === 'function' ? calculateKin(birthDate) : null;
    };

    const tzolkinBirth = getTzolkinBirth();
    const seal = tzolkinBirth ? seals[tzolkinBirth.seal] : null;
    const tone = tzolkinBirth ? tones[tzolkinBirth.tone - 1] : null;
    const syucai = birthDate ? calculateSyucai(birthDate) : null;

    const accent = accentColor || seal?.color || '#F3F4F6';

    // Генерация ИИ-портрета
    const generateAiPortrait = async () => {
        if (!birthDate || !tzolkinBirth || !syucai) return;

        setLoadingPortrait(true);
        try {
            const response = await fetch('/api/analyze-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthDate,
                    kin: tzolkinBirth.kin,
                    tone: tzolkinBirth.tone,
                    seal: seals[tzolkinBirth.seal].name,
                    consciousness: syucai.consciousness,
                    mission: syucai.mission
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAiPortrait(data.portrait);
            } else {
                console.log('ИИ-портрет недоступен, статус:', response.status);
                setAiPortrait('ИИ-портрет будет доступен после деплоя на сервер.');
            }
        } catch (error) {
            console.log('ИИ-портрет пропущен:', error.message);
            setAiPortrait('ИИ-портрет доступен только при деплое на Vercel.');
        }
        setLoadingPortrait(false);
    };

    // Сохранение профиля
    const saveProfile = async () => {
        if (!name || !birthDate) {
            alert('Введите имя и дату рождения');
            return;
        }

        const profile = {
            name,
            birthDate,
            tzolkinBirth: getTzolkinBirth(),
            syucai: calculateSyucai(birthDate),
            aiPortrait
        };

        setUserProfile(profile);

        // Сохраняем в localStorage для офлайн-доступа
        localStorage.setItem('userProfile', JSON.stringify(profile));

        // Сохраняем в Supabase через глобальную функцию
        const userId = typeof getUserId === 'function' ? getUserId() : localStorage.getItem('user_id');
        if (typeof saveProfileToSupabase === 'function') {
            const saved = await saveProfileToSupabase(userId, profile);
            if (!saved) {
                console.log('Профиль сохранен локально, синхронизация с сервером будет позже');
            }
        }

        setIsEditing(false);
        window.tgHapticLight?.();

        // Генерируем портрет только если его еще нет
        if (!aiPortrait && !loadingPortrait) {
            generateAiPortrait();
        }
    };

    const { User, Edit2, Calendar } = window.LucideReact || {};

    // Значения Сюцай
    const syucaiMeanings = {
        1: { name: 'Единица', essence: 'Лидерство, инициатива, начало' },
        2: { name: 'Двойка', essence: 'Партнёрство, дипломатия, баланс' },
        3: { name: 'Тройка', essence: 'Творчество, самовыражение, радость' },
        4: { name: 'Четвёрка', essence: 'Стабильность, структура, порядок' },
        5: { name: 'Пятёрка', essence: 'Свобода, изменения, опыт' },
        6: { name: 'Шестёрка', essence: 'Любовь, служение, гармония' },
        7: { name: 'Семёрка', essence: 'Мудрость, анализ, духовность' },
        8: { name: 'Восьмёрка', essence: 'Сила, изобилие, влияние' },
        9: { name: 'Девятка', essence: 'Завершение, трансформация, свет' }
    };

    if (isEditing) {
        return (
            <div className="min-h-screen text-white px-4 pt-4 pb-32 fade-in">
                {/* Header */}
                <div className="max-w-2xl mx-auto mb-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-2xl font-bold tracking-wide text-white">Ваш Профиль</div>
                            <div className="mt-1.5 text-sm text-white/50 font-light">Tzolk'in + Сюцай портрет</div>
                        </div>
                        <button
                            onClick={() => {
                                window.tgHapticLight?.();
                                setShowInfo(true);
                            }}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl glass-card text-cyan-400/80 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
                            style={{
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                            }}
                            title="О профиле"
                        >
                            {window.LucideReact?.Info ? (
                                <window.LucideReact.Info size={20} strokeWidth={2} />
                            ) : (
                                <span>ℹ️</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Форма редактирования */}
                <div
                    className="max-w-2xl mx-auto rounded-3xl glass-card-strong p-6"
                    style={{
                        borderColor: hexToRgba(accent, 0.25),
                        backgroundImage: `radial-gradient(900px circle at 50% 0%, ${hexToRgba(accent, 0.15)}, transparent 60%)`,
                        boxShadow: `0 0 25px ${hexToRgba(accent, 0.12)}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
                    }}
                >
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm text-white/70 mb-2 font-medium">Ваше имя</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-2xl glass-card px-4 py-3 text-sm text-white/90 placeholder:text-white/40 outline-none transition-all duration-300 focus:bg-white/10 focus:border-cyan-400/30"
                                style={{
                                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                }}
                                placeholder="Введите имя"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-white/70 mb-2 font-medium">Дата рождения</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full rounded-2xl glass-card px-4 py-3 text-sm text-white/90 outline-none transition-all duration-300 focus:bg-white/10 focus:border-cyan-400/30"
                                style={{
                                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                }}
                            />
                        </div>

                        <button
                            onClick={saveProfile}
                            disabled={!name || !birthDate}
                            className="w-full min-h-[56px] rounded-3xl px-4 py-4 text-sm font-bold text-white transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            style={{
                                background: `linear-gradient(135deg, ${hexToRgba(accent, 1)}, ${hexToRgba(accent, 0.70)})`,
                                boxShadow: `0 0 30px ${hexToRgba(accent, 0.35)}, 0 4px 20px rgba(0, 0, 0, 0.3)`
                            }}
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {window.LucideReact?.Save ? <window.LucideReact.Save size={22} strokeWidth={2} /> : null}
                                Сохранить профиль
                            </span>
                        </button>
                    </div>
                </div>

                {/* Информационное модальное окно */}
                {showInfo && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
                        style={{
                            background: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(8px)'
                        }}
                        onClick={() => setShowInfo(false)}
                    >
                        <div
                            className="max-w-lg w-full rounded-3xl glass-card-strong p-6 max-h-[80vh] overflow-y-auto"
                            style={{
                                borderColor: 'rgba(34, 211, 238, 0.3)',
                                background: 'linear-gradient(135deg, rgba(6, 10, 18, 0.95), rgba(6, 12, 22, 0.92))',
                                boxShadow: '0 0 40px rgba(34, 211, 238, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-xl font-bold text-white">О вашем профиле</div>
                                <button
                                    onClick={() => {
                                        window.tgHapticLight?.();
                                        setShowInfo(false);
                                    }}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl glass-card text-white/70 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
                                >
                                    {window.LucideReact?.X ? (
                                        <window.LucideReact.X size={18} strokeWidth={2} />
                                    ) : (
                                        <span>✕</span>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-4 text-sm text-white/80 leading-relaxed">
                                <div>
                                    <div className="flex items-center gap-2 font-semibold text-cyan-400 mb-2">
                                        {window.LucideReact?.Layers ? (
                                            <window.LucideReact.Layers size={18} strokeWidth={2} />
                                        ) : null}
                                        Двойная система анализа
                                    </div>
                                    <p>Профиль объединяет <strong>Tzolk'in</strong> (майянский календарь) и <strong>Сюцай</strong> (китайскую нумерологию) для глубокого понимания вашей личности.</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 font-semibold text-amber-400 mb-2">
                                        {window.LucideReact?.Calendar ? (
                                            <window.LucideReact.Calendar size={18} strokeWidth={2} />
                                        ) : null}
                                        Зачем вводить дату рождения?
                                    </div>
                                    <p>Ваша дата рождения определяет:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-white/70">
                                        <li><strong>Кин рождения</strong> — вашу базовую энергетическую подпись (из 260 дней цикла)</li>
                                        <li><strong>Число Сознания</strong> — ключ к самопознанию (1-9)</li>
                                        <li><strong>Число Миссии</strong> — ваше жизненное предназначение (1-9)</li>
                                    </ul>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 font-semibold text-purple-400 mb-2">
                                        {window.LucideReact?.Bot ? (
                                            <window.LucideReact.Bot size={18} strokeWidth={2} />
                                        ) : null}
                                        ИИ-персонализация
                                    </div>
                                    <p>После заполнения профиля <strong>ИИ-советы</strong> станут <em>персонализированными</em>:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-white/70">
                                        <li>Анализ резонанса между вашим Кином и текущим днём</li>
                                        <li>Связь вашей Миссии с фазами волны</li>
                                        <li>Учёт личных дней по Сюцай (рассчитываются автоматически)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white px-4 pt-4 pb-32 fade-in">
            {/* Header */}
            <div className="max-w-2xl mx-auto mb-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-2xl font-bold tracking-wide text-white flex items-center gap-2">
                            {User ? <User size={26} strokeWidth={2} className="text-white/70" /> : null}
                            {name || 'Профиль'}
                        </div>
                        <div className="mt-1.5 text-sm text-white/50 font-light">
                            {birthDate ? new Date(birthDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Добавьте дату рождения'}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                window.tgHapticLight?.();
                                setShowInfo(true);
                            }}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl glass-card text-cyan-400/80 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
                            style={{
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                            }}
                            title="О профиле"
                        >
                            {window.LucideReact?.Info ? (
                                <window.LucideReact.Info size={20} strokeWidth={2} />
                            ) : (
                                <span>ℹ️</span>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                window.tgHapticLight?.();
                                setIsEditing(true);
                            }}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl glass-card text-cyan-400/80 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
                            style={{
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                            }}
                            title="Редактировать"
                        >
                            {Edit2 ? <Edit2 size={20} strokeWidth={2} /> : <span>✏️</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Информационное модальное окно */}
            {showInfo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
                    style={{
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)'
                    }}
                    onClick={() => setShowInfo(false)}
                >
                    <div
                        className="max-w-lg w-full rounded-3xl glass-card-strong p-6 max-h-[80vh] overflow-y-auto"
                        style={{
                            borderColor: 'rgba(34, 211, 238, 0.3)',
                            background: 'linear-gradient(135deg, rgba(6, 10, 18, 0.95), rgba(6, 12, 22, 0.92))',
                            boxShadow: '0 0 40px rgba(34, 211, 238, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xl font-bold text-white">О вашем профиле</div>
                            <button
                                onClick={() => {
                                    window.tgHapticLight?.();
                                    setShowInfo(false);
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl glass-card text-white/70 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
                            >
                                {window.LucideReact?.X ? (
                                    <window.LucideReact.X size={18} strokeWidth={2} />
                                ) : (
                                    <span>✕</span>
                                )}
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-white/80 leading-relaxed">
                            <div>
                                <div className="flex items-center gap-2 font-semibold text-cyan-400 mb-2">
                                    {window.LucideReact?.Layers ? (
                                        <window.LucideReact.Layers size={18} strokeWidth={2} />
                                    ) : null}
                                    Двойная система анализа
                                </div>
                                <p>Профиль объединяет <strong>Tzolk'in</strong> (майянский календарь) и <strong>Сюцай</strong> (китайскую нумерологию) для глубокого понимания вашей личности.</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 font-semibold text-amber-400 mb-2">
                                    {window.LucideReact?.Calendar ? (
                                        <window.LucideReact.Calendar size={18} strokeWidth={2} />
                                    ) : null}
                                    Зачем вводить дату рождения?
                                </div>
                                <p>Ваша дата рождения определяет:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-white/70">
                                    <li><strong>Кин рождения</strong> — вашу базовую энергетическую подпись (из 260 дней цикла)</li>
                                    <li><strong>Число Сознания</strong> — ключ к самопознанию (1-9)</li>
                                    <li><strong>Число Миссии</strong> — ваше жизненное предназначение (1-9)</li>
                                </ul>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 font-semibold text-purple-400 mb-2">
                                    {window.LucideReact?.Bot ? (
                                        <window.LucideReact.Bot size={18} strokeWidth={2} />
                                    ) : null}
                                    ИИ-персонализация
                                </div>
                                <p>После заполнения профиля <strong>ИИ-советы</strong> станут <em>персонализированными</em>:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-white/70">
                                    <li>Анализ резонанса между вашим Кином и текущим днём</li>
                                    <li>Связь вашей Миссии с фазами волны</li>
                                    <li>Учёт личных дней по Сюцай (рассчитываются автоматически)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Центральная печать Цолькин */}
            {tzolkinBirth && seal && tone && (
                <div
                    className="max-w-2xl mx-auto mb-6 rounded-3xl glass-card-strong p-8"
                    style={{
                        borderColor: hexToRgba(accent, 0.35),
                        backgroundImage: `radial-gradient(800px circle at 50% 0%, ${hexToRgba(accent, 0.22)}, transparent 60%)`,
                        boxShadow: `0 0 30px ${hexToRgba(accent, 0.20)}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                    }}
                >
                    <div className="text-center">
                        <div className="text-xs text-white/50 font-medium tracking-wider uppercase mb-3">Ваш Кин</div>
                        <div className="text-5xl font-bold tracking-tight mb-3" style={{ color: seal.color }}>
                            {tzolkinBirth.tone} {seal.name}
                        </div>
                        <div className="text-sm text-white/70 font-light mb-4">{seal.essence}</div>

                        <div className="grid grid-cols-2 gap-3 mt-5">
                            <div
                                className="rounded-2xl glass-card p-4"
                                style={{
                                    borderColor: hexToRgba(accent, 0.25),
                                    backgroundImage: `radial-gradient(600px circle at 0% 0%, ${hexToRgba(accent, 0.15)}, transparent 70%)`,
                                    boxShadow: `0 0 15px ${hexToRgba(accent, 0.1)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                                }}
                            >
                                <div className="text-xs text-white/50 font-medium">Кин</div>
                                <div className="mt-1.5 text-2xl font-bold text-white">{tzolkinBirth.kin}</div>
                            </div>
                            <div
                                className="rounded-2xl glass-card p-4"
                                style={{
                                    borderColor: hexToRgba(accent, 0.25),
                                    backgroundImage: `radial-gradient(600px circle at 100% 0%, ${hexToRgba(accent, 0.15)}, transparent 70%)`,
                                    boxShadow: `0 0 15px ${hexToRgba(accent, 0.1)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                                }}
                            >
                                <div className="text-xs text-white/50 font-medium">Тон</div>
                                <div className="mt-1.5 text-2xl font-bold text-white">{tone.n} • {tone.name}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Карточки Сюцай */}
            {syucai && (
                <div className="max-w-2xl mx-auto mb-6 grid grid-cols-2 gap-4">
                    <div
                        className="rounded-3xl glass-card-strong p-6"
                        style={{
                            borderColor: hexToRgba('#F59E0B', 0.25),
                            backgroundImage: `radial-gradient(700px circle at 0% 50%, ${hexToRgba('#F59E0B', 0.15)}, transparent 60%)`,
                            boxShadow: `0 0 20px ${hexToRgba('#F59E0B', 0.12)}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
                        }}
                    >
                        <div className="text-xs text-white/50 font-medium tracking-wider uppercase mb-2">Число Сознания</div>
                        <div className="text-4xl font-bold text-amber-400 mb-2">{syucai.consciousness}</div>
                        <div className="text-xs font-medium text-white/80 mb-1">{syucaiMeanings[syucai.consciousness].name}</div>
                        <div className="text-xs text-white/60">{syucaiMeanings[syucai.consciousness].essence}</div>
                    </div>

                    <div
                        className="rounded-3xl glass-card-strong p-6"
                        style={{
                            borderColor: hexToRgba('#06b6d4', 0.25),
                            backgroundImage: `radial-gradient(700px circle at 100% 50%, ${hexToRgba('#06b6d4', 0.15)}, transparent 60%)`,
                            boxShadow: `0 0 20px ${hexToRgba('#06b6d4', 0.12)}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
                        }}
                    >
                        <div className="text-xs text-white/50 font-medium tracking-wider uppercase mb-2">Число Миссии</div>
                        <div className="text-4xl font-bold text-cyan-400 mb-2">{syucai.mission}</div>
                        <div className="text-xs font-medium text-white/80 mb-1">{syucaiMeanings[syucai.mission].name}</div>
                        <div className="text-xs text-white/60">{syucaiMeanings[syucai.mission].essence}</div>
                    </div>
                </div>
            )}

            {/* ИИ-портрет */}
            <div
                className="max-w-2xl mx-auto rounded-3xl glass-card-strong p-6"
                style={{
                    borderColor: 'rgba(217, 70, 239, 0.25)',
                    background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.08), rgba(168, 85, 247, 0.05))',
                    boxShadow: '0 0 20px rgba(217, 70, 239, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-white tracking-wide">ИИ-портрет личности</div>
                    {!aiPortrait && birthDate && (
                        <button
                            onClick={() => {
                                window.tgHapticLight?.();
                                generateAiPortrait();
                            }}
                            disabled={loadingPortrait}
                            className="text-xs px-3 py-2 rounded-xl glass-card text-white/80 transition-all duration-300 hover:bg-white/10 disabled:opacity-50 active:scale-[0.95]"
                            style={{
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                            }}
                        >
                            {loadingPortrait ? 'Генерация...' : 'Создать'}
                        </button>
                    )}
                </div>

                {loadingPortrait ? (
                    <div className="flex items-center justify-center py-8">
                        {window.LucideReact?.Loader2 ? (
                            <window.LucideReact.Loader2 size={32} strokeWidth={2} className="animate-spin text-purple-400" />
                        ) : (
                            <div className="text-white/60">Генерирую портрет...</div>
                        )}
                    </div>
                ) : aiPortrait ? (
                    <div className="text-sm text-white/80 leading-relaxed">{aiPortrait}</div>
                ) : (
                    <div className="text-sm text-white/50 text-center py-6">
                        Добавьте дату рождения, чтобы получить персональный ИИ-портрет
                    </div>
                )}
            </div>
        </div>
    );
};
