# Marble Blast Powered Up Web - Mod API #
Hi! This file demonstrates the Custom Properties of Marble Blast Powered Up Webport and Mis Modding...Well, The changes that can be done directly from a mis file.

**Disclaimer:** The Following Custom PowerUp properties could be added as dynamic fields for the specific PowerUp.

# Custom PowerUp Properties #
 `superJumpHeight = 20;`
 
 `superSpeedStrenght = 25;` 
 
 `gyrocopterTime = 5000;`
 
 `gyrocopterGravityMultiplier = 0.25;`
 
 `airAcceleration = 5;`
 
 `superBounceTime = 5000;`
 
 `bounceRestitution = 0.9;`

 `shockAbsorberTime = 5000;`

 `stopWatchTime = 5000;`

 `glueTime = 5000;`

 `metalTime = 5000;`

 `paperTime = 5000;`

 # Custom Gameplay #
 **Disclaimer:** The Following Custom Properties could be added in the Mission Element Script object or in the Mis file Metadata.
 
 **Backward Timer Levels:**
 
 `backwardClock = "true";` Whether the level should have a Backward Timer or not.
 
 **NOTE:**
 `time` must be set for the Timer to count from maximum time otherwise the clock is defaulted to 0.

 **Competency Levels:**
 
 `Competency = "1";` Whether the level is a Competency level or not.

 **Gravity Criterion levels:**
 
 `requireGravity = "1";`  When set, you must be less than 60 degrees apart from the finish pad's rotation in gravity to finish.

 # Custom Level Properties #

 **Overridden Gravity:**

 For a level to have modded Gravity or overridden gravity, the mis file should have the global call `setMarbleAttributes("gravity", 5);`

 **Custom Jump Ability:**

 For a level featuring Special Jump, Wall Jump, Double Jump accompanied with Air Dash Effect, the mis file should have the global call `setMarbleAttributes("enableCustomJumpAndDash", 1);`

 **Custom Jump Impulse:**

 For a level to have marble's modded Jump Impulse, the mis file should have the global call
 
 `setMarbleAttributes("jumpImpulse", 7.5);`

 **Custom Bounce Restitution:**
 
 For a level to have marble's modded Bounce Restitution, the mis file should have the global call `setMarbleAttributes("bounceRestitution", 0.9);`

 # Moving Objects Speed #

 **Chasing Tornado's Speed:**

 For a level containing a chasing tornado, Change its approaching speed by 
 `chaseSpeed`.

 # Quieter Tornados #

 **Reduced Tornado Volume:**

 For a level to have quieter Tornados (The ones whose audio won't cause Headaches) the `quietTornados = "yes";` flag could be set in the mis file metadata or in the Mission Element Script Object of the mis file.

 

 

 



