# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation "Skip links":
    - link "Skip to main content" [ref=e2] [cursor=pointer]:
      - /url: "#main-content"
    - link "Skip to editor" [ref=e3] [cursor=pointer]:
      - /url: "#editor-panel"
    - link "Skip to chat" [ref=e4] [cursor=pointer]:
      - /url: "#chat-panel"
  - banner "Via-gent" [ref=e6]:
    - generic [ref=e7]:
      - link "Via-gent" [ref=e8] [cursor=pointer]:
        - /url: /
        - img [ref=e9]
        - generic [ref=e10]: Via-gent
      - navigation "Main navigation" [ref=e11]:
        - link "Home" [ref=e12] [cursor=pointer]:
          - /url: /
      - button "Select layout preset" [ref=e15]:
        - img [ref=e16]
        - generic [ref=e18]: Default
        - img [ref=e19]
    - generic [ref=e21]:
      - button "Search..." [ref=e22]:
        - img [ref=e23]
        - generic [ref=e26]: Search...
        - generic [ref=e27]:
          - img [ref=e28]
          - generic [ref=e30]: K
      - button "Settings" [ref=e31]:
        - img [ref=e32]
      - button "User menu" [ref=e35]:
        - img [ref=e36]
```