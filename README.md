# Introduction

This repo implements some of the CvRDTs described in [A comprehensive study of Convergent and
Commutative Replicated Data Types (2011)](https://hal.inria.fr/inria-00555588/).

I will be using this space to experiment with CvRDTs and build basic TypeScript code infrastructure
(e.g. standardized way of testing) for developing more CvRDTs.

Anyone is welcome to participate. :-)

## Design goals

- Naming of variables, classes, interfaces and other identifiers should adhere to the semantics
  described in the paper.

- Develop a consistent structure for composing new CvRDTs from other CvRDTs.

- Full test coverage:

  - State equivalence - `a` and `b` have equivalent abstract states if all query operation return
    the same value.

  - Update operations adheres to the semantics described in its definition. This should be asserted
    on the return values of the query operations.

  - Merging operation has to be eventually consistent.

    1. Associative - operations can be group abitrarily

       ```ts
       merge(merge(a, b), c) === merge(a, merge(b, c));
       ```

    2. Commutative - operations can be ordered arbitrarily

       ```ts
       merge(a, b) === merge(b, a);
       ```

    3. Idempotent - operations can be applied multiple times without changes the result

       ```ts
       (merge(a, merge(a, b)) === merge(merge(a, b), b)) === merge(a, b);
       ```
