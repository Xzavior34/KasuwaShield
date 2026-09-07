I've spent the last few days building something for a Somnia x DreamDEX hackathon, and it taught me more than any course could have.

I'd never deployed a smart contract before this. Now I've got three of them live on a testnet, all source verified, all doing real work.

The project is called KasuwaShield. Here's the actual problem it solves. On DreamDEX, "Event Contracts" expire every 15 minutes. If you're holding a position and you don't babysit it, your protection just runs out and nobody tells you. KasuwaShield turns one wallet approval into a self renewing hedge. A contract decides on its own whether the next roll is safe, and it refuses to execute the moment it isn't.

What made this feel different from a normal hackathon build is that I didn't want to just demo something and hope people believed me. I wanted proof.

So there's a keeper daemon running unattended right now, executing real on chain policy rolls with zero human clicking a button.

There's a real order that filled on live DreamDEX, not a simulation, and you can look up the transaction yourself.

There's a security bug I actually found in my own contract's access control, and instead of hiding it I documented it and fixed it.

And every claim on the project page links straight to the proof. Not "trust me", just click and check.

Along the way I learned how gas limits actually work when a transaction reverts, how to tell an out of gas error apart from a logic error just by looking at the numbers, and that verifying a contract on a block explorer is its own small adventure.

I came into this not knowing how to deploy a contract. I'm coming out of it having shipped real infrastructure that runs by itself and holds up to scrutiny.

If you're building in the Somnia or DreamDEX ecosystem, or you just want to talk about what it takes to build something that doesn't fall apart the moment someone checks your work, I'd love to connect. And if you're hiring for anything that touches product, Web3, or building fast with AI assisted tools, I'm open to hearing about it.

#Web3 #Somnia #DeFi #SmartContracts #BuildInPublic
