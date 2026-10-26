import test from "node:test";
import assert from "node:assert/strict";
import { callIdentity } from "../../../../extension/src/callIdentity.ts";
import { companionCallRefSchema } from "../../../../src/contracts/companion.ts";

for (const origin of ["https://telemost.yandex.ru", "https://telemost.360.yandex.ru"]) {
  for (const room of ["1234567890", "12345678901234"]) {
    test(`Telemost ${origin} accepts ${room.length}-digit rooms through browser and desktop validation`, () => {
      for (const route of ["j", "@/j", "private-join"]) {
        const ref = callIdentity(`${origin}/${route}/${room}?skip_app=1`);
        assert.deepEqual(ref, { platform: "telemost", callId: room });
        assert.equal(companionCallRefSchema.safeParse({
          ...ref,
          installationId: "11111111-1111-4111-8111-111111111111",
          sessionId: "22222222-2222-4222-8222-222222222222",
          documentId: "1234567890abcdef1234567890abcdef",
          tabId: 7,
        }).success, true);
      }
    });
  }
}

test("Telemost accepts only exact supported HTTPS origins and observed room shapes", () => {
  for (const origin of [
    "http://telemost.360.yandex.ru", "https://telemost.360.yandex.ru.evil.test",
    "https://telemost.yandex.ru.evil.test", "https://evil.test/telemost.360.yandex.ru",
    "https://telemost.360.yandex.ru:8443", "https://telemost.360.yandex.ru@evil.test",
  ]) assert.equal(callIdentity(`${origin}/j/1234567890`), null);
  for (const room of ["123456789", "12345678901", "1234567890123", "123456789012345", "abcdefghij"])
    assert.equal(callIdentity(`https://telemost.360.yandex.ru/j/${room}`), null);
  for (const route of ["chats", "other/j/1234567890", "j/1234567890/extra"])
    assert.equal(callIdentity(`https://telemost.360.yandex.ru/${route}`), null);
  assert.deepEqual(callIdentity("https://meet.google.com/abc-defg-hij"), { platform: "google-meet", callId: "abc-defg-hij" });
});
