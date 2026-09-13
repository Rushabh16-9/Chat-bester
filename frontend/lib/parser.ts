export interface Message {
  date_raw: string;
  time_raw: string;
  datetime: Date | null;
  sender: string;
  message: string;
  is_system: boolean;
  is_media: boolean;
  is_deleted: boolean;
}

export interface ParticipantStat {
  name: string;
  message_count: number;
  message_percentage: number;
  word_count: number;
  avg_words_per_msg: number;
  media_count: number;
  deleted_count: number;
  emoji_count: number;
  top_emojis: { emoji: string; count: number }[];
  conversation_starts: number;
  questions_asked: number;
  double_text_count: number;
  links_shared: number;
  avg_response_time_minutes: number | string;
}

export interface AnalyticsResult {
  total_messages: number;
  total_emojis_count: number;
  participants: ParticipantStat[];
  starter_champion: string;
  most_talkative: string;
  media_king: string;
  emoji_queen: string;
  overall_top_emojis: { emoji: string; count: number }[];
  hourly_distribution: { hour: string; count: number }[];
  day_distribution: { day: string; count: number }[];
  recent_snippet: string;
}

// Regex patterns
const LINE_REGEX_1 = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*-\s*(.+)$/;
const LINE_REGEX_2 = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*\]\s*(.+)$/;

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu;

const SYSTEM_PATTERNS = [
  "Messages and calls are end-to-end encrypted",
  "is a contact",
  "changed their phone number",
  "added you",
  "created group",
  "changed the group description",
  "left",
];

export function extractEmojis(text: string): string[] {
  return text.match(EMOJI_REGEX) || [];
}

export function parseWhatsAppChat(rawText: string): Message[] {
  const lines = rawText.split(/\r?\n/);
  const parsedMessages: Message[] = [];
  let currentMsg: Message | null = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const match1 = line.match(LINE_REGEX_1);
    const match2 = line.match(LINE_REGEX_2);
    const match = match1 || match2;

    if (match) {
      if (currentMsg) {
        parsedMessages.push(currentMsg);
        currentMsg = null;
      }

      const [, datePart, timePart, contentPart] = match;

      if (contentPart.includes(":")) {
        const colonIdx = contentPart.indexOf(":");
        const sender = contentPart.substring(0, colonIdx).trim();
        const message = contentPart.substring(colonIdx + 1).trim();

        if (SYSTEM_PATTERNS.some((p) => contentPart.includes(p)) && !message) {
          continue;
        }

        currentMsg = {
          date_raw: datePart,
          time_raw: timePart,
          datetime: parseDate(datePart, timePart),
          sender,
          message,
          is_system: false,
          is_media: message.includes("<Media omitted>") || message.includes("(file attached)"),
          is_deleted: message.includes("You deleted this message") || message.includes("This message was deleted"),
        };
      } else {
        currentMsg = {
          date_raw: datePart,
          time_raw: timePart,
          datetime: parseDate(datePart, timePart),
          sender: "System",
          message: contentPart,
          is_system: true,
          is_media: false,
          is_deleted: false,
        };
      }
    } else if (currentMsg) {
      currentMsg.message += `\n${line}`;
      if (line.includes("<Media omitted>") || line.includes("(file attached)")) {
        currentMsg.is_media = true;
      }
      if (line.includes("This message was deleted") || line.includes("You deleted this message")) {
        currentMsg.is_deleted = true;
      }
    }
  }

  if (currentMsg) {
    parsedMessages.push(currentMsg);
  }

  return parsedMessages;
}

function parseDate(dateStr: string, timeStr: string): Date | null {
  try {
    const parts = dateStr.split("/");
    if (parts.length < 3) return null;

    let [m, d, y] = parts.map((p) => parseInt(p, 10));
    if (y < 100) y += 2000;

    let [h, min] = timeStr.replace(/[^\d:]/g, "").split(":").map((p) => parseInt(p, 10));
    if (timeStr.toLowerCase().includes("pm") && h < 12) h += 12;
    if (timeStr.toLowerCase().includes("am") && h === 12) h = 0;

    return new Date(y, m - 1, d, h || 0, min || 0);
  } catch {
    return null;
  }
}

export function computeAnalytics(messages: Message[]): AnalyticsResult {
  const chatMsgs = messages.filter((m) => !m.is_system);
  const senders = Array.from(new Set(chatMsgs.map((m) => m.sender)));

  const statsMap: Record<string, any> = {};
  senders.forEach((s) => {
    statsMap[s] = {
      name: s,
      message_count: 0,
      word_count: 0,
      media_count: 0,
      deleted_count: 0,
      emoji_count: 0,
      emojis: {} as Record<string, number>,
      conversation_starts: 0,
      questions_asked: 0,
      double_text_count: 0,
      links_shared: 0,
      response_times: [] as number[],
    };
  });

  const totalEmojiMap: Record<string, number> = {};
  const hourly: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourly[i] = 0;

  const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayMap: Record<string, number> = {};
  daysList.forEach((d) => (dayMap[d] = 0));

  let prevMsg: Message | null = null;
  const GAP_HOURS = 4;

  chatMsgs.forEach((msg) => {
    const s = msg.sender;
    const st = statsMap[s];
    st.message_count += 1;

    const words = msg.message.split(/\s+/).filter(Boolean);
    st.word_count += words.length;

    if (msg.is_media) st.media_count += 1;
    if (msg.is_deleted) st.deleted_count += 1;
    if (msg.message.includes("?")) st.questions_asked += (msg.message.match(/\?/g) || []).length;
    if (/https?:\/\/|youtu\.be|instagram\.com/.test(msg.message)) st.links_shared += 1;

    const ems = extractEmojis(msg.message);
    if (ems.length > 0) {
      st.emoji_count += ems.length;
      ems.forEach((e) => {
        st.emojis[e] = (st.emojis[e] || 0) + 1;
        totalEmojiMap[e] = (totalEmojiMap[e] || 0) + 1;
      });
    }

    if (msg.datetime) {
      const h = msg.datetime.getHours();
      hourly[h] = (hourly[h] || 0) + 1;

      const dayIdx = (msg.datetime.getDay() + 6) % 7; // Mon = 0
      dayMap[daysList[dayIdx]] += 1;

      if (prevMsg && prevMsg.datetime) {
        const diffSec = (msg.datetime.getTime() - prevMsg.datetime.getTime()) / 1000;
        if (diffSec >= GAP_HOURS * 3600) {
          st.conversation_starts += 1;
        }
        if (prevMsg.sender !== s && diffSec > 0 && diffSec <= 7200) {
          st.response_times.push(diffSec / 60);
        }
        if (prevMsg.sender === s && diffSec <= 120) {
          st.double_text_count += 1;
        }
      } else {
        st.conversation_starts += 1;
      }
    }

    prevMsg = msg;
  });

  const totalMsgs = chatMsgs.length;
  const participantsSummary: ParticipantStat[] = senders.map((s) => {
    const st = statsMap[s];
    const avgResp = st.response_times.length
      ? Math.round(st.response_times.reduce((a: number, b: number) => a + b, 0) / st.response_times.length)
      : "N/A";

    const topEms = Object.entries(st.emojis as Record<string, number>)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emoji, count]) => ({ emoji, count }));

    return {
      name: s,
      message_count: st.message_count,
      message_percentage: Math.round((st.message_count / Math.max(totalMsgs, 1)) * 1000) / 10,
      word_count: st.word_count,
      avg_words_per_msg: Math.round((st.word_count / Math.max(st.message_count, 1)) * 10) / 10,
      media_count: st.media_count,
      deleted_count: st.deleted_count,
      emoji_count: st.emoji_count,
      top_emojis: topEms,
      conversation_starts: st.conversation_starts,
      questions_asked: st.questions_asked,
      double_text_count: st.double_text_count,
      links_shared: st.links_shared,
      avg_response_time_minutes: avgResp,
    };
  });

  const overallTopEms = Object.entries(totalEmojiMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([emoji, count]) => ({ emoji, count }));

  const starterChampion = participantsSummary.length
    ? [...participantsSummary].sort((a, b) => b.conversation_starts - a.conversation_starts)[0].name
    : "N/A";

  const mostTalkative = participantsSummary.length
    ? [...participantsSummary].sort((a, b) => b.message_count - a.message_count)[0].name
    : "N/A";

  const mediaKing = participantsSummary.length
    ? [...participantsSummary].sort((a, b) => b.media_count - a.media_count)[0].name
    : "N/A";

  const emojiQueen = participantsSummary.length
    ? [...participantsSummary].sort((a, b) => b.emoji_count - a.emoji_count)[0].name
    : "N/A";

  const recentMsgs = chatMsgs.slice(-25);
  const recentSnippet = recentMsgs.map((m) => `${m.sender}: ${m.message}`).join("\n");

  return {
    total_messages: totalMsgs,
    total_emojis_count: Object.values(totalEmojiMap).reduce((a, b) => a + b, 0),
    participants: participantsSummary,
    starter_champion: starterChampion,
    most_talkative: mostTalkative,
    media_king: mediaKing,
    emoji_queen: emojiQueen,
    overall_top_emojis: overallTopEms,
    hourly_distribution: Object.entries(hourly).map(([h, cnt]) => ({
      hour: `${h.padStart(2, "0")}:00`,
      count: cnt,
    })),
    day_distribution: Object.entries(dayMap).map(([day, cnt]) => ({ day, count: cnt })),
    recent_snippet: recentSnippet,
  };
}
