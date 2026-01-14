const FullCalendarScreen = ({ selectedDate, setSelectedDate, seals, tones }) => {
    const pad2 = (n) => String(n).padStart(2, '0');
    const formatDateLocal = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

    const toDateObj = (dateStr) => new Date(dateStr + 'T00:00:00');

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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 pb-24">
            <div className="max-w-2xl mx-auto">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-lg font-semibold text-white">Калькулятор</div>
                            <div className="mt-1 text-sm text-white/60">Julian Day, Long Count и Цолькин</div>
                        </div>
                        <div className="text-white/60">
                            {window.LucideReact?.CalendarDays ? (
                                <window.LucideReact.CalendarDays size={20} strokeWidth={1.5} />
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 items-stretch">
                    <button
                        type="button"
                        onClick={() => {
                            window.tgHapticLight?.();
                            changeDate(-1);
                        }}
                        className="min-h-[50px] rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 transition duration-300 hover:bg-white/10 active:scale-[0.98]"
                        aria-label="Предыдущий день"
                    >
                        <span className="inline-flex items-center justify-center">
                            {window.LucideReact?.ChevronLeft ? (
                                <window.LucideReact.ChevronLeft size={20} strokeWidth={1.5} />
                            ) : (
                                '◀'
                            )}
                        </span>
                    </button>

                    <div className="min-h-[50px] rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-xl">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                window.tgHapticLight?.();
                                setSelectedDate(e.target.value);
                            }}
                            className="w-full bg-transparent text-center text-sm text-white/90 outline-none"
                        />
                        <div className="mt-1 text-[11px] text-white/55">{dateLabel}</div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            window.tgHapticLight?.();
                            changeDate(1);
                        }}
                        className="min-h-[50px] rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 transition duration-300 hover:bg-white/10 active:scale-[0.98]"
                        aria-label="Следующий день"
                    >
                        <span className="inline-flex items-center justify-center">
                            {window.LucideReact?.ChevronRight ? (
                                <window.LucideReact.ChevronRight size={20} strokeWidth={1.5} />
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
                    className="mt-3 w-full min-h-[50px] rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white/90 transition duration-300 hover:bg-white/10 active:scale-[0.98]"
                >
                    <span className="inline-flex items-center justify-center gap-2">
                        {window.LucideReact?.Calendar ? (
                            <window.LucideReact.Calendar size={20} strokeWidth={1.5} />
                        ) : null}
                        Сегодня
                    </span>
                </button>

                <div className="mt-4 space-y-3">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                        <div className="text-sm font-semibold text-white">Julian Day</div>
                        <div className="mt-2 text-3xl font-semibold text-white">{jdn}</div>
                        <div className="mt-1 text-sm text-white/60">Астрономический счёт дней</div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                        <div className="text-sm font-semibold text-white">13 Лун</div>
                        {moon13.isDayOutOfTime ? (
                            <div className="mt-2 text-2xl font-semibold text-white">День Вне Времени</div>
                        ) : (
                            <div className="mt-2 text-2xl font-semibold text-white">
                                {moon13.day} • {moon13.moonName} ({moon13.moon})
                            </div>
                        )}
                        <div className="mt-1 text-sm text-white/60">Кин: {moon13.dayOfYear} • Год начинается 26 июля • Год: {moon13.yearStartYear}/{moon13.yearStartYear + 1}</div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                        <div className="text-sm font-semibold text-white">Long Count</div>
                        <div className="mt-2 text-2xl font-semibold text-white">
                            {longCount.baktun}.{longCount.katun}.{longCount.tun}.{longCount.winal}.{longCount.kin}
                        </div>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                            {[
                                ['baktun', longCount.baktun],
                                ['katun', longCount.katun],
                                ['tun', longCount.tun],
                                ['winal', longCount.winal],
                                ['kin', longCount.kin]
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                                    <div className="text-[11px] text-white/55">{label}</div>
                                    <div className="mt-1 font-semibold text-white">{value}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-sm text-white/60">Дней с начала эры: {longCount.total.toLocaleString()}</div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                        <div className="text-sm font-semibold text-white">Цолькин</div>
                        <div className="mt-2 text-3xl font-semibold" style={{ color: seal?.color || undefined }}>
                            {tzolkin.tone} {seal?.name || '—'}
                        </div>
                        {tzolkin.isLeapDay ? (
                            <div className="mt-1 text-xs text-white/50">29 февраля: високосный день вне счёта (кин не сдвигается)</div>
                        ) : null}
                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                                <div className="text-[11px] text-white/55">Тон</div>
                                <div className="mt-1 font-semibold text-white">{tzolkin.tone}</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                                <div className="text-[11px] text-white/55">Печать</div>
                                <div className="mt-1 font-semibold text-white">{tzolkin.glyph + 1}</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                                <div className="text-[11px] text-white/55">Кин</div>
                                <div className="mt-1 font-semibold text-white">{tzolkin.kin}</div>
                            </div>
                        </div>
                        {tone ? (
                            <div className="mt-3 text-sm text-white/60">Тон: {tone.n} • {tone.name}</div>
                        ) : null}
                    </div>

                    <div className="text-center text-xs text-white/45">
                        GMT Correlation: 584283
                    </div>
                </div>
            </div>
        </div>
    );
};
