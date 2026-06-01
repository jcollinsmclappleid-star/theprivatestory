---
name: editors-picks charBVoice override
description: Why picks 09/10 need charBVoice=MV_THEO to avoid a two-male-voice split for the same character
---

For editor's picks where the NARRATOR is male AND plays the protagonist (picks 09 "The Neighbour", 10 "The Night Manager" with Theo), the default resolveCharacterVoicesServer("Her & Him") assigns charB=James. That means "he said" dialogue goes to James while narration is Theo — same character, two voices.

**Fix**: Add `charBVoice: MV_THEO` to any pick where narrator=Theo and story is male-POV. generateOne() reads `pick.charBVoice ?? charBResolved`.

**How to apply**: Any future Her&Him pick with a male narrator and male-protagonist POV should set `charBVoice: narratorVoiceId` in the pick definition.
