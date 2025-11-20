---
title: Mastodon bug fix
date: '2023-10-12T00:00:00.000Z'
shortDescription: >-
  Mastodon is a FOSS social network. I contributed a fix for the broken emoji
  picker, which got merged into the code base, benefiting over 10 million users.
image: assets/mastodon.png
languages: Javascript
imageAlt: >-
  The mastodon logo at the top, on a purple background of diagonal waves.
  There's a mastodon cartoon smiling, pointing at a locked padlock to the right.
url: 'https://github.com/mastodon/mastodon/pull/29012'
technologies: 'Git, React'
---
Mastodon is a free and open source, federated social network. Mastodon is part of the fediverse, which is a network of Mastodon (and others!) instances that connect together to form one big, mostly interconnected social network. Each instance has its own rules, and they get to decide which instances they connect (or "federate") with based on these rules. They all have their own subcultures and community niches! It's very fun.

I was writing a post on my instance, and went to insert an emoji. When I tried to close the emoji picker, it flashed and came back up again. It blocked the post button and made it impossible to do anything. So, I did what any good FOSS enthusiast would do: I downloaded the source code to investigate the problem!

## The problem

On first glance, I saw that 2 things controlled the toggle state of the emoji picker:

* The emoji button itself

* The `handleDocumentClick` event listener, allowing you to dismiss the emoji picker by clicking elsewhere on the page

This stands to reason then, that if you were clicking the emoji button to dismiss the picker, *the* `handleDocumentClick` *would still get triggered*. Because the button toggles the emoji picker, and so does the `handleDocumentClick`, which also toggles it, the overall change is moot. It'll just end up dismissing and reappearing again!

## The fix

Pretty simple. I just created a `ref` for the emoji button, and added a check in `handleDocumentClick` to see if the target element matched the emoji button. If it did? Ignore the event. And sure enough, after testing, the fix finally worked!

## The outcome

So I went onto Masotodon's GitHub repo with my fix, and submitted a pull request detailing the issue and my solution. To my excitement, the at the time CEO of Mastodon: Gargron himself accepted and merged my solution into Mastodon's main codebase! My fix now benefits Mastodon's 1+ million active users.
