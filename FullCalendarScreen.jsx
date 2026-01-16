const FullCalendarScreen = ({ selectedDate, setSelectedDate, seals, tones }) => {
    const { useState } = React;
    const [infoModal, setInfoModal] = useState(null);

    const pad2 = (n) => String(n).padStart(2, '0');
    const formatDateLocal = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

    const toDateObj = (dateStr) => new Date(dateStr + 'T00:00:00');

    const calendarInfo = {
        julianDay: {
            title: 'Julian Day Number',
            description: 'Юлианский день — это непрерывный счёт дней с полудня 1 января 4713 года до н. э. по юлианскому календарю. Это астрономический стандарт для отслеживания времени, широко используемый в науке. Каждый день имеет уникальный номер, что упрощает расчёты между датами и эпохами. Система Julian Day не зависит от часовых поясов и календарных реформ, что делает её универсальным инструментом для астрономов, историков и математиков.',
        },
        thirteenMoon: {
            title: '13 Лун (Dreamspell)',
            description: 'Календарь 13 Лун — это современная интерпретация календаря майя, созданная Хосе Аргуэльесом. Год делится на 13 месяцев (лун) по 28 дней каждый, итого 364 дня, плюс один «День Вне Времени» 25 июля. Новый год начинается 26 июля. Эта система синхронизирована с природными циклами и лунным ритмом, предлагая гармоничный способ отслеживания времени. Календарь помогает настроиться на природные ритмы и отказаться от искусственного 12-месячного григорианского календаря.',
        },
        longCount: {
            title: 'Long Count (Длинный счёт)',
            description: 'Long Count — это система летоисчисления майя, отсчитывающая дни с мифической даты создания мира (11 августа 3114 года до н. э.). Записывается в формате baktun.katun.tun.winal.kin. Один кин = 1 день, winal = 20 дней, tun = 360 дней, katun = 7200 дней, baktun = 144000 дней. Эта система позволяет точно датировать исторические события на протяжении тысячелетий. Long Count использовался майя для записи важных дат и астрономических наблюдений.',
        },
        tzolkin: {
            title: 'Цолькин (Священный календарь)',
            description: 'Цолькин — это 260-дневный священный календарь майя, состоящий из 20 солнечных печатей и 13 тонов. Каждый день имеет уникальную комбинацию тона (1-13) и печати (глифа). Это основа духовной и ритуальной жизни майя. Цолькин синхронизирован с циклами беременности человека (260 дней), астрономическими событиями и природными ритмами. Каждая комбинация тона и печати несёт особую энергию и качества, влияющие на события и решения.',
        }
    };

    const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    const leapYearsBeforeYear = (y) => {
        const n = y - 1;
        if (n < 0) return 0;
        return Math.floor(n / 4) - Math.floor(n / 100) + Math.floor(n / 400);
    };
    const leapDaysBeforeDate = (date) => {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        // Count Feb 29 that happened strictly before this date.
        return leapYearsBeforeYear(y) + (isLeapYear(y) && m > 2 ? 1 : 0);
    };

    // Calculate Julian Day Number from Gregorian date
    const gregorianToJulianDay = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const a = Math.floor((14 - month) / 12);
        const y = year + 4800 - a;
        const m = month + 12 * a - 3;

        return (
            day +
            Math.floor((153 * m + 2) / 5) +
            365 * y +
            Math.floor(y / 4) -
            Math.floor(y / 100) +
            Math.floor(y / 400) -
            32045
        );
    };

    // Calculate Long Count from Julian Day (GMT correlation: 584283)
    const julianDayToLongCount = (jdn) => {
        const GMT_CORRELATION = 584283;
        const daysSinceCreation = jdn - GMT_CORRELATION;

        const baktun = Math.floor(daysSinceCreation / 144000);
        const katun = Math.floor((daysSinceCreation % 144000) / 7200);
        const tun = Math.floor((daysSinceCreation % 7200) / 360);
        const winal = Math.floor((daysSinceCreation % 360) / 20);
        const kin = ((daysSinceCreation % 20) + 20) % 20;

        return { baktun, katun, tun, winal, kin, total: daysSinceCreation };
    };

    // Dreamspell-style Tzolkin (kin 1..260), where Feb 29 is excluded from the kin progression.
    // Anchored to your reference screenshots: 2026-01-14 => Kin 36 (Tone 10, Seal 16 Warrior).
    const dreamspellTzolkin = (date) => {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const day = date.getDate();

        const isLeapDay = m === 2 && day === 29;
        const effectiveDate = isLeapDay ? new Date(y, 1, 28) : date;

        const adjustedSerial = (dt) => gregorianToJulianDay(dt) - leapDaysBeforeDate(dt);

        const anchorDate = new Date('2026-01-14T00:00:00');
        const anchorKin = 36;
        const anchorSerial = adjustedSerial(anchorDate);
        const serial = adjustedSerial(effectiveDate);

        let pos = (anchorKin - 1 + (serial - anchorSerial)) % 260;
        pos = (pos + 260) % 260;

        return {
            kin: pos + 1,
            tone: (pos % 13) + 1,
            glyph: pos % 20, // 0..19 (seal index)
            isLeapDay
        };
    };

    // 13-Moon (Dreamspell) Calendar
    // Year starts on July 26; July 25 is the "Day Out of Time".
    const gregorianTo13Moon = (date) => {
        const moonNames = [
            'Магнитная',
            'Лунная',
            'Электрическая',
            'Самосущая',
            'Обертонная',
            'Ритмическая',
            'Резонансная',
            'Галактическая',
            'Солнечная',
            'Планетарная',
            'Спектральная',
            'Кристаллическая',
            'Космическая'
        ];

        const msPerDay = 24 * 60 * 60 * 1000;
        const y = date.getFullYear();

        const yearStartThis = new Date(y, 6, 26); // Jul 26
        const yearStartYear = date < yearStartThis ? y - 1 : y;
        const yearStart = new Date(yearStartYear, 6, 26);

        // Exclude Feb 29 from the 13-Moon day count if it happens within the current 13-Moon year span.
        // 13-Moon year spans Jul 26 (yearStartYear) -> Jul 25 (yearStartYear+1).
        const isLeapDay = date.getMonth() === 1 && date.getDate() === 29;
        const effectiveDate = isLeapDay ? new Date(date.getFullYear(), 1, 28) : date;

        const leapYearInSpan = isLeapYear(yearStartYear + 1);
        const leapDay = new Date(yearStartYear + 1, 1, 29);

        let daysSinceStart = Math.floor((effectiveDate - yearStart) / msPerDay);
        if (leapYearInSpan && effectiveDate >= leapDay) {
            daysSinceStart -= 1;
        }

        if (daysSinceStart === 364) {
            return {
                yearStartYear,
                isDayOutOfTime: true,
                dayOfYear: 365
            };
        }

        const moonIndex = Math.floor(daysSinceStart / 28); // 0..12
        const dayInMoon = (daysSinceStart % 28) + 1; // 1..28

        return {
            yearStartYear,
            isDayOutOfTime: false,
            moon: moonIndex + 1,
            moonName: moonNames[moonIndex] || '—',
            day: dayInMoon,
            dayOfYear: daysSinceStart + 1
        };
    };

    const dateObj = toDateObj(selectedDate);
    const jdn = gregorianToJulianDay(dateObj);
    const longCount = julianDayToLongCount(jdn);
    const tzolkin = dreamspellTzolkin(dateObj);
    const moon13 = gregorianTo13Moon(dateObj);

    const seal = seals?.[tzolkin.glyph];
    const tone = tones?.[tzolkin.tone - 1];

    const hexToRgba = (hex, a) => {
        const h = String(hex || '').replace('#', '');
        if (h.length !== 6) return `rgba(255,255,255,${a})`;
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${a})`;
    };

    const accent = seal?.color || '#F3F4F6';

    const changeDate = (days) => {
        const d = toDateObj(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(formatDateLocal(d));
    };

    const setToday = () => {
        setSelectedDate(formatDateLocal(new Date()));
    };

    const dateLabel = dateObj.toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen text-white p-4 pb-32 fade-in">
            <div className="max-w-2xl mx-auto">
                <div
                    className="rounded-3xl glass-card-strong p-6"
                    style={{
                        borderColor: hexToRgba(accent, 0.25),
                        backgroundImage: `radial-gradient(900px circle at 10% 0%, ${hexToRgba(accent, 0.18)}, transparent 60%)`,
                        boxShadow: `0 0 30px ${hexToRgba(accent, 0.15)}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                    }}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-xl font-bold tracking-wide text-white">Калькулятор</div>
                            <div className="mt-1.5 text-sm text-white/50 font-light">Julian Day, Long Count и Цолькин</div>
                        </div>
                        <div className="text-cyan-400/80">
                            {window.LucideReact?.CalendarDays ? (
                                <window.LucideReact.CalendarDays size={24} strokeWidth={2} />
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 items-stretch">
                    <button
                        type="button"
                        onClick={() => {
                            window.tgHapticLight?.();
                            changeDate(-1);
                        }}
                        className="min-h-[56px] rounded-3xl glass-card px-4 py-3 text-white/90 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
                        style={{
                            borderColor: hexToRgba(accent, 0.20),
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        }}
                        aria-label="Предыдущий день"
                    >
                        <span className="inline-flex items-center justify-center">
                            {window.LucideReact?.ChevronLeft ? (
                                <window.LucideReact.ChevronLeft size={22} strokeWidth={2} />
                            ) : (
                                '◀'
                            )}
                        </span>
                    </button>

                    <div
                        className="min-h-[56px] rounded-3xl glass-card-strong px-4 py-3 text-center"
                        style={{
                            borderColor: hexToRgba(accent, 0.30),
                            backgroundImage: `radial-gradient(700px circle at 50% 0%, ${hexToRgba(accent, 0.15)}, transparent 70%)`,
                            boxShadow: `0 0 20px ${hexToRgba(accent, 0.15)}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                        }}
                    >
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                window.tgHapticLight?.();
                                setSelectedDate(e.target.value);
                            }}
                            className="w-full bg-transparent text-center text-sm font-semibold text-white/90 outline-none"
                        />
                        <div className="mt-1 text-[11px] text-white/50">{dateLabel}</div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            window.tgHapticLight?.();
                            changeDate(1);
                        }}
                        className="min-h-[56px] rounded-3xl glass-card px-4 py-3 text-white/90 transition-all duration-300 hover:bg-white/10 active:scale-[0.95]"
                        style={{
                            borderColor: hexToRgba(accent, 0.20),
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        }}
                        aria-label="Следующий день"
                    >
                        <span className="inline-flex items-center justify-center">
                            {window.LucideReact?.ChevronRight ? (
                                <window.LucideReact.ChevronRight size={22} strokeWidth={2} />
                            ) : (
                                '▶'
                            )}
                        </span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        window.tgHapticLight?.();
                        setToday();
                    }}
                    className="mt-4 w-full min-h-[56px] rounded-3xl px-4 py-4 text-sm font-bold text-white transition-all duration-300 hover:opacity-90 active:scale-[0.98] pulse-glow"
                    style={{
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.35), rgba(14, 165, 233, 0.25))',
                        border: '1.5px solid rgba(6, 182, 212, 0.5)',
                        boxShadow: '0 0 30px rgba(6, 182, 212, 0.35), 0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <span className="inline-flex items-center justify-center gap-2">
                        {window.LucideReact?.Calendar ? (
                            <window.LucideReact.Calendar size={22} strokeWidth={2} />
                        ) : null}
                        Сегодня
                    </span>
                </button>

                <div className="mt-6 space-y-4">
                    <div
                        className="rounded-3xl glass-card-strong p-6"
                        style={{
                            borderColor: hexToRgba(accent, 0.18),
                            backgroundImage: `radial-gradient(900px circle at 10% 0%, ${hexToRgba(accent, 0.14)}, transparent 65%)`,
                            boxShadow: `0 0 20px ${hexToRgba(accent, 0.12)}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
                        }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white tracking-wide">Julian Day</div>
                                <div className="mt-2 text-3xl font-bold text-white">{jdn}</div>
                                <div className="mt-1 text-sm text-white/60 font-light">Астрономический счёт дней</div>
                            </div>
                            <button
                                onClick={() => {
                                    window.tgHapticLight?.();
                                    setInfoModal('julianDay');
                                }}
                                className="flex-shrink-0 w-8 h-8 rounded-full glass-card flex items-center justify-center text-cyan-400/70 hover:text-cyan-400 hover:bg-white/10 transition-all duration-300"
                                style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}
                            >
                                {window.LucideReact?.Info ? <window.LucideReact.Info size={16} strokeWidth={2} /> : 'i'}
                            </button>
                        </div>
                    </div>

                    <div
                        className="rounded-3xl glass-card-strong p-6"
                        style={{
                            borderColor: hexToRgba(accent, 0.18),
                            backgroundImage: `radial-gradient(900px circle at 90% 0%, ${hexToRgba(accent, 0.14)}, transparent 65%)`,
                            boxShadow: `0 0 20px ${hexToRgba(accent, 0.12)}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
                        }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white tracking-wide">13 Лун</div>
                                {moon13.isDayOutOfTime ? (
                                    <div className="mt-2 text-2xl font-bold text-white">День Вне Времени</div>
                                ) : (
                                    <div className="mt-2 text-2xl font-bold text-white">
                                        {moon13.day} • {moon13.moonName} ({moon13.moon})
                                    </div>
                                )}
                                <div className="mt-1 text-sm text-white/60 font-light">Кин: {moon13.dayOfYear} • Год начинается 26 июля • Год: {moon13.yearStartYear}/{moon13.yearStartYear + 1}</div>
                            </div>
                            <button
                                onClick={() => {
                                    window.tgHapticLight?.();
                                    setInfoModal('thirteenMoon');
                                }}
                                className="flex-shrink-0 w-8 h-8 rounded-full glass-card flex items-center justify-center text-cyan-400/70 hover:text-cyan-400 hover:bg-white/10 transition-all duration-300"
                                style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}
                            >
                                {window.LucideReact?.Info ? <window.LucideReact.Info size={16} strokeWidth={2} /> : 'i'}
                            </button>
                        </div>
                    </div>

                    <div
                        className="rounded-3xl glass-card-strong p-6"
                        style={{
                            borderColor: hexToRgba(accent, 0.18),
                            backgroundImage: `radial-gradient(900px circle at 10% 100%, ${hexToRgba(accent, 0.12)}, transparent 65%)`,
                            boxShadow: `0 0 20px ${hexToRgba(accent, 0.12)}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
                        }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-sm font-bold text-white tracking-wide">Long Count</div>
                            <button
                                onClick={() => {
                                    window.tgHapticLight?.();
                                    setInfoModal('longCount');
                                }}
                                className="flex-shrink-0 w-8 h-8 rounded-full glass-card flex items-center justify-center text-cyan-400/70 hover:text-cyan-400 hover:bg-white/10 transition-all duration-300"
                                style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}
                            >
                                {window.LucideReact?.Info ? <window.LucideReact.Info size={16} strokeWidth={2} /> : 'i'}
                            </button>
                        </div>
                        <div className="text-2xl font-bold text-white mb-4">
                            {longCount.baktun}.{longCount.katun}.{longCount.tun}.{longCount.winal}.{longCount.kin}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 text-sm">
                            {[
                                ['baktun', longCount.baktun],
                                ['katun', longCount.katun],
                                ['tun', longCount.tun],
                                ['winal', longCount.winal],
                                ['kin', longCount.kin]
                            ].map(([label, value]) => (
                                <div key={label} className="flex-shrink-0 rounded-2xl glass-card p-3 text-center min-w-[80px]" style={{
                                    boxShadow: `0 2px 10px ${hexToRgba(accent, 0.1)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                                }}>
                                    <div className="text-[11px] text-white/50 font-medium uppercase">{label}</div>
                                    <div className="mt-1 font-bold text-white text-lg">{value}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-sm text-white/60 font-light">Дней с начала эры: {longCount.total.toLocaleString()}</div>
                    </div>

                    <div
                        className="rounded-3xl glass-card-strong p-6"
                        style={{
                            borderColor: hexToRgba(accent, 0.25),
                            backgroundImage: `radial-gradient(900px circle at 90% 100%, ${hexToRgba(accent, 0.15)}, transparent 65%)`,
                            boxShadow: `0 0 25px ${hexToRgba(accent, 0.15)}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                        }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-sm font-bold text-white tracking-wide">Цолькин</div>
                            <button
                                onClick={() => {
                                    window.tgHapticLight?.();
                                    setInfoModal('tzolkin');
                                }}
                                className="flex-shrink-0 w-8 h-8 rounded-full glass-card flex items-center justify-center text-cyan-400/70 hover:text-cyan-400 hover:bg-white/10 transition-all duration-300"
                                style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}
                            >
                                {window.LucideReact?.Info ? <window.LucideReact.Info size={16} strokeWidth={2} /> : 'i'}
                            </button>
                        </div>
                        <div className="text-3xl font-bold" style={{ color: seal?.color || undefined }}>
                            {tzolkin.tone} {seal?.name || '—'}
                        </div>
                        {tzolkin.isLeapDay ? (
                            <div className="mt-2 text-xs text-white/50 font-light">29 февраля: високосный день вне счёта (кин не сдвигается)</div>
                        ) : null}
                        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                            <div className="rounded-2xl glass-card p-3 text-center" style={{
                                boxShadow: `0 2px 10px ${hexToRgba(accent, 0.12)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                            }}>
                                <div className="text-[11px] text-white/50 font-medium">Тон</div>
                                <div className="mt-1 font-bold text-white">{tzolkin.tone}</div>
                            </div>
                            <div className="rounded-2xl glass-card p-3 text-center" style={{
                                boxShadow: `0 2px 10px ${hexToRgba(accent, 0.12)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                            }}>
                                <div className="text-[11px] text-white/50 font-medium">Печать</div>
                                <div className="mt-1 font-bold text-white">{tzolkin.glyph + 1}</div>
                            </div>
                            <div className="rounded-2xl glass-card p-3 text-center" style={{
                                boxShadow: `0 2px 10px ${hexToRgba(accent, 0.12)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                            }}>
                                <div className="text-[11px] text-white/50 font-medium">Кин</div>
                                <div className="mt-1 font-bold text-white">{tzolkin.kin}</div>
                            </div>
                        </div>
                        {tone ? (
                            <div className="mt-4 text-sm text-white/60 font-light">Тон: {tone.n} • {tone.name}</div>
                        ) : null}
                    </div>

                    <div className="text-center text-xs text-white/40 font-light">
                        GMT Correlation: 584283
                    </div>
                </div>

                {/* Info Modal */}
                {infoModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(5, 7, 10, 0.85)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setInfoModal(null)}
                    >
                        <div
                            className="max-w-lg w-full rounded-3xl glass-card-strong p-6 fade-in"
                            style={{
                                borderColor: 'rgba(6, 182, 212, 0.3)',
                                backgroundImage: 'radial-gradient(900px circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 70%)',
                                boxShadow: '0 0 40px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-bold text-white tracking-wide">{calendarInfo[infoModal]?.title}</h3>
                                <button
                                    onClick={() => setInfoModal(null)}
                                    className="flex-shrink-0 w-8 h-8 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                                    style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}
                                >
                                    {window.LucideReact?.X ? <window.LucideReact.X size={18} strokeWidth={2} /> : '×'}
                                </button>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed font-light">
                                {calendarInfo[infoModal]?.description}
                            </p>
                            <button
                                onClick={() => setInfoModal(null)}
                                className="mt-6 w-full min-h-[48px] rounded-3xl px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.35), rgba(14, 165, 233, 0.25))',
                                    border: '1.5px solid rgba(6, 182, 212, 0.5)',
                                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
