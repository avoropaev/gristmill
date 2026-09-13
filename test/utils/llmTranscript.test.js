const test = require("node:test");
const assert = require("node:assert/strict");

const load = () => import("../../src/utils/llmTranscript.ts");

const t = (key, options) => {
  if (key === "notes.speaker.label") return `Speaker ${options.n}`;
  if (key === "notes.speaker.them") return "Them";
  if (key === "notes.speaker.you") return "You";
  return key;
};

const attendee = (email, displayName, self = false) => ({
  email,
  displayName,
  responseStatus: null,
  self,
});

test("mic segments carry the note owner's label", async () => {
  const { resolveLlmSpeakerLabel } = await load();
  assert.equal(resolveLlmSpeakerLabel({ source: "mic", text: "hi" }, {}, "Alex Example", t), "Alex Example");
  assert.equal(
    resolveLlmSpeakerLabel({ source: "system", speaker: "you", text: "hi" }, {}, "Alex Example", t),
    "Alex Example"
  );
});

test("system segments resolve name → mapping → Speaker N → Them", async () => {
  const { resolveLlmSpeakerLabel } = await load();
  const locked = {
    source: "system",
    speaker: "speaker_0",
    speakerName: "Michael",
    speakerLocked: true,
    text: "hi",
  };
  assert.equal(resolveLlmSpeakerLabel(locked, { speaker_0: "Wrong" }, "You", t), "Michael");
  assert.equal(
    resolveLlmSpeakerLabel({ source: "system", speaker: "speaker_1", text: "hi" }, { speaker_1: "Sean" }, "You", t),
    "Sean"
  );
  assert.equal(
    resolveLlmSpeakerLabel({ source: "system", speaker: "speaker_2", text: "hi" }, {}, "You", t),
    "Speaker 3"
  );
  assert.equal(resolveLlmSpeakerLabel({ source: "system", text: "hi" }, {}, "You", t), "Them");
});

test("buildLlmTranscript prefixes every line with the resolved label", async () => {
  const { buildLlmTranscript } = await load();
  const segments = [
    { source: "mic", text: "Morning everyone" },
    { source: "system", speaker: "speaker_0", text: "Morning" },
  ];
  assert.equal(
    buildLlmTranscript(segments, { speaker_0: "Michael" }, "Alex", t),
    "Alex: Morning everyone\nMichael: Morning"
  );
});

test("buildMeetingContext names the owner and invited participants", async () => {
  const { buildMeetingContext } = await load();
  const identity = {
    selfName: "Alex Example",
    selfEmail: "alex@example.com",
    participants: [
      attendee("alex@example.com", "Alex Example", true),
      attendee("michael@example.com", "Michael Chen"),
      attendee("sean@example.com", null),
    ],
  };
  assert.equal(
    buildMeetingContext(identity, "Alex Example"),
    [
      "## Meeting Context",
      'The user taking these notes ("Alex Example" in the transcript) is Alex Example <alex@example.com>.',
      "Invited participants: Michael Chen <michael@example.com>, sean@example.com.",
    ].join("\n")
  );
});

test("buildMeetingContext omits what it does not know", async () => {
  const { buildMeetingContext } = await load();
  assert.equal(buildMeetingContext({ selfName: null, selfEmail: null, participants: [] }, "You"), "");
  assert.equal(
    buildMeetingContext(
      { selfName: null, selfEmail: null, participants: [attendee("a@example.com", "Ada")] },
      "You"
    ),
    "## Meeting Context\nInvited participants: Ada <a@example.com>."
  );
});

test("collectKnownPeople merges owner, participants, mappings, and named segments", async () => {
  const { collectKnownPeople } = await load();
  const people = collectKnownPeople(
    {
      selfName: "Alex Example",
      selfEmail: "alex@example.com",
      participants: [
        attendee("alex@example.com", "Alex Example", true),
        attendee("michael@example.com", "Michael Chen"),
        attendee("sean@example.com", null),
      ],
    },
    { speaker_0: "Michael Chen", speaker_1: "Priya" },
    [{ source: "system", speaker: "speaker_2", speakerName: "Ada", text: "hi" }]
  );
  assert.deepEqual(people, [
    { name: "Alex Example", email: "alex@example.com" },
    { name: "Michael Chen", email: "michael@example.com" },
    { name: "sean", email: "sean@example.com" },
    { name: "Priya", email: null },
    { name: "Ada", email: null },
  ]);
});
